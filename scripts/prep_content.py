#!/usr/bin/env python3
"""
Content preparation and auto-tagging pipeline.
Parses markdown files in `raw_papers/` and compiles them into structured JSON
at `src/data/papers.json` and `src/data/taxonomy.json`.

Supports:
- Markdown tables
- Bullet lists (* Key: Value)
- Google Docs plain text / tab indented exports
- Deduplication by normalized title and slug
"""

import datetime
import json
import re
from pathlib import Path

# Coffee Science Auto-Tagging Taxonomy
TAXONOMY_RULES = {
    "SensoryScience": [
        "ประสาทสัมผัส",
        "sensory",
        "flavor",
        "กลิ่นรส",
        "ความฝาด",
        "บอดี้",
        "astringency",
        "lexicon",
        "cupping",
    ],
    "CoffeeBody": [
        "บอดี้",
        "coffee body",
        "mouthcoating",
        "thickness",
        "สัมผัสในช่องปาก",
        "mouthfeel",
    ],
    "Astringency": ["ความฝาด", "astringency", "แห้งสาก", "puckering"],
    "Melanoidins": ["เมลาโนอิดิน", "melanoidin", "melanoidins"],
    "RoastingChemistry": [
        "การคั่ว",
        "roasting",
        "roast",
        "อุณหพลศาสตร์",
        "first crack",
        "second crack",
        "degassing",
    ],
    "MaillardReaction": ["เมลลาร์ด", "maillard", "ปฏิกิริยาเมลลาร์ด"],
    "Acrylamide": ["อะคริลาไมด์", "acrylamide"],
    "5-HMF": ["5-hmf", "5-hydroxymethylfurfural", "furfural"],
    "SucrosePyrolysis": [
        "ซูโครส",
        "sucrose",
        "ไพโรไลซิส",
        "pyrolysis",
        "fructofuranosyl",
    ],
    "Phenolics": [
        "ฟีนอลิก",
        "phenolic",
        "โพลีฟีนอล",
        "polyphenol",
        "chlorogenic",
        "กรดคลอโรจีนิก",
        "5-cqa",
    ],
    "Extraction": [
        "การสกัด",
        "extraction",
        "เอสเปรสโซ",
        "ดริป",
        "drip",
        "yield",
        "ช็อต",
        "brewing",
        "cold brew",
        "immersion",
    ],
    "SpecialtyCoffee": [
        "กาแฟพิเศษ",
        "specialty coffee",
        "sca",
        "third-wave",
        "คลื่นลูกที่สาม",
    ],
    "Q-Grader": ["q-grader", "q-arabica", "คัพปิ้ง", "cupping", "ผู้ประเมินคุณภาพ"],
    "FoodSafety": [
        "ความปลอดภัยทางอาหาร",
        "ก่อมะเร็ง",
        "สารปนเปื้อน",
        "carcinogen",
        "iarc",
        "efsa",
    ],
    "Tribology": ["ไตรโบโลยี", "tribology", "แรงเสียดทาน", "น้ำลาย", "salivary"],
    "KineticModeling": [
        "kinetic",
        "จลนศาสตร์",
        "แบบจำลองจลนศาสตร์",
        "arrhenius",
        "สมการอนุพันธ์",
        "modeling",
    ],
    "FT-ICR-MS": [
        "ft-icr",
        "mass spectrometry",
        "แมสสเปกโทรเมตรี",
        "uplc-qqq-ms",
        "lc-ms",
        "nmr",
    ],
    "Fermentation": [
        "การหมัก",
        "fermentation",
        "yeast",
        "ยีสต์",
        "anaerobic",
        "carbonic maceration",
        "lactiplantibacillus",
    ],
    "WaterChemistry": [
        "น้ำสำหรับการสกัด",
        "water recipe",
        "cations",
        "hardness",
        "mg2+",
        "ca2+",
        "ไบคาร์บอเนต",
        "alkalinity",
    ],
    "GrindingPhysics": [
        "การบด",
        "grinding",
        "fines",
        "particle size",
        "triboelectrification",
        "ผงละเอียด",
    ],
}


def _assign_meta(meta: dict, key: str, val: str):
    val = val.strip()
    if not val or val == "รายละเอียด":
        return
    if "ชื่อบทความวิจัย" in key and not meta.get("englishTitle"):
        meta["englishTitle"] = val
    elif ("คณะผู้วิจัย" in key or "ผู้วิจัย" in key) and not meta.get("authors"):
        meta["authors"] = val
    elif ("สถาบัน" in key or "หน่วยงาน" in key) and not meta.get("institution"):
        meta["institution"] = val
    elif "วารสารวิชาการ" in key and not meta.get("journal"):
        meta["journal"] = val
    elif "ลิงก์งานวิจัย" in key and not meta.get("links"):
        meta["links"] = val


def extract_metadata(text: str, slug: str = "") -> dict:
    metadata = {}

    # 1. Filename pattern: e.g. [2026-09-05] The Role of Dissolved Cations in Coffee Extraction
    fn_match = re.match(r"^\[(\d{4}-\d{2}-\d{2})\]\s*(.+)$", slug)
    if fn_match:
        metadata["dateFromFilename"] = fn_match.group(1)
        metadata["englishTitle"] = fn_match.group(2).strip()

    # 2. Markdown Table Pattern
    table_match = re.search(
        r"## ข้อมูลงานวิจัย.*?\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)",
        text,
    )
    if table_match:
        rows = table_match.group(1).strip().split("\n")
        for row in rows:
            cols = [c.strip() for c in row.split("|")[1:-1]]
            if len(cols) >= 2:
                key = re.sub(r"[*_]", "", cols[0]).strip()
                val = cols[1].strip()
                _assign_meta(metadata, key, val)

    # 3. Bullet Point Pattern: * ชื่อบทความวิจัย: ...
    bullet_matches = re.findall(r"^[*\-•]\s*([^\n:]+):\s*([^\n]+)", text, re.MULTILINE)
    for k, v in bullet_matches:
        _assign_meta(metadata, k.strip(), v.strip())

    # 4. Google Docs plain text / tab format
    gdoc_matches = re.findall(
        r"(ชื่อบทความวิจัย|คณะผู้วิจัย|ผู้วิจัย|สถาบัน|หน่วยงาน|วารสารวิชาการ|ลิงก์งานวิจัย)\s*\n\s*([^\n]+)",
        text,
    )
    for k, v in gdoc_matches:
        _assign_meta(metadata, k.strip(), v.strip())

    return metadata


def clean_paper_content(content: str) -> str:
    content = content.lstrip("\ufeff")
    # Find start of section 1
    m = re.search(
        r"(?:^|\n)\s*(?:##\s*)?1\.\s*(?:วัตถุประสงค์|บทนำ|ที่มา|ความสำคัญ|[^\n]+)", content
    )
    if m:
        content = content[m.start() :].strip()

    # Remove mock signature at bottom
    content = re.sub(r"\n+ลงชื่อผู้ตรวจสอบรายงาน:[^\n]*", "", content)

    # Standardize main section headings with markdown '## '
    content = re.sub(
        r"(?:^|\n)\s*(?:##\s*)?1\.\s*(วัตถุประสงค์[^\n]*)", r"\n\n## 1. \1\n\n", content
    )
    content = re.sub(
        r"(?:^|\n)\s*(?:##\s*)?2\.\s*(ระเบียบวิธี[^\n]*)", r"\n\n## 2. \1\n\n", content
    )
    content = re.sub(
        r"(?:^|\n)\s*(?:##\s*)?3\.\s*(ผลการค้นพบ[^\n]*)", r"\n\n## 3. \1\n\n", content
    )
    content = re.sub(
        r"(?:^|\n)\s*(?:##\s*)?4\.\s*(การนำไปประยุกต์[^\n]*)",
        r"\n\n## 4. \1\n\n",
        content,
    )

    # Subsections e.g. 3.1, 3.2
    content = re.sub(
        r"(?:^|\n)\s*(?:###\s*)?(\d+\.\d+)\.?\s+([^\n]+)", r"\n\n### \1 \2\n\n", content
    )

    content = re.sub(r"\n{3,}", "\n\n", content).strip()
    return content


def parse_paper(file_path: Path):
    content = file_path.read_text(encoding="utf-8")
    slug = file_path.stem

    # Extract metadata from table / bullets / tabs
    meta = extract_metadata(content, slug)

    # Extract Date
    date_str = meta.get("dateFromFilename", "")
    if not date_str:
        date_match = re.search(r"\*\*วันที่:\*\*\s*([^\n]+)", content)
        if not date_match:
            date_match = re.search(r"วันที่:\s*([^\n]+)", content)
        if date_match:
            date_str = date_match.group(1).strip()

    # Extract Category
    category = "วิทยาศาสตร์กาแฟทั่วไป (General Coffee Science)"
    cat_match = re.search(r"\*\*หมวดหมู่:\*\*\s*([^\n]+)", content)
    if not cat_match:
        cat_match = re.search(r"หมวดหมู่:\s*([^\n]+)", content)
    if cat_match:
        category = cat_match.group(1).strip()

    # Title: English research paper title if available, else clean header
    title = meta.get("englishTitle")
    if not title:
        # Check first line
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        if lines and lines[0].startswith("# "):
            title = lines[0].replace("# ", "").strip()
        else:
            title = slug.replace("-", " ").title()

    # Document Header (e.g. รายงานวิจัยวิทยาศาสตร์กาแฟเชิงลึก)
    doc_header = "รายงานวิจัยวิทยาศาสตร์กาแฟเชิงลึก (Coffee Science Deep Research)"
    header_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if header_match:
        doc_header = header_match.group(1).strip()

    # Extract Excerpt (from Section 1)
    excerpt = ""
    sec1_match = re.search(
        r"(?:##\s*)?1\.\s*วัตถุประสงค์และที่มาของงานวิจัย\s*\n\s*(.+?)(?=\n\n|\n\d\.|\n##)",
        content,
        re.DOTALL,
    )
    if sec1_match:
        cleaned = re.sub(r"[*_#]", "", sec1_match.group(1)).strip()
        excerpt = cleaned[:240] + ("..." if len(cleaned) > 240 else "")
    else:
        # Fallback excerpt: first substantial paragraph
        paragraphs = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 80]
        if paragraphs:
            cleaned = re.sub(r"[*_#]", "", paragraphs[0]).strip()
            excerpt = cleaned[:240] + ("..." if len(cleaned) > 240 else "")

    # Auto-Tagging
    content_lower = content.lower()
    matched_tags = []
    for tag, keywords in TAXONOMY_RULES.items():
        if any(kw.lower() in content_lower for kw in keywords):
            matched_tags.append(tag)

    # Word count and reading time
    word_count = len(re.findall(r"\w+", content))
    reading_time = max(1, round(word_count / 180))

    # Clean body content to strip redundant preamble metadata
    cleaned_body = clean_paper_content(content)

    return {
        "id": slug,
        "slug": slug,
        "title": title,
        "documentHeader": doc_header,
        "date": date_str,
        "category": category,
        "authors": meta.get("authors", ""),
        "institution": meta.get("institution", ""),
        "journal": meta.get("journal", ""),
        "links": meta.get("links", ""),
        "excerpt": excerpt,
        "tags": matched_tags,
        "wordCount": word_count,
        "readingTimeMinutes": reading_time,
        "content": cleaned_body,
    }


def main():
    raw_dir = Path("raw_papers")
    data_dir = Path("src/data")
    data_dir.mkdir(parents=True, exist_ok=True)

    if not raw_dir.exists():
        print(f"⚠️ [WARNING] {raw_dir} does not exist.")
        return

    raw_papers_list = []
    seen_titles = {}

    raw_files = []
    for ext in ("*.md", "*.txt"):
        for f in raw_dir.glob(ext):
            if not f.name.startswith("."):
                raw_files.append(f)
    raw_files = sorted(raw_files, key=lambda p: p.name)

    FORMAT_PRIORITY = {".md": 2, ".txt": 1}

    for paper_file in raw_files:
        paper = parse_paper(paper_file)

        # Deduplication check: if a paper with identical normalized title exists, preserve higher-priority format (.md > .txt)
        norm_title = re.sub(r"[^\w\u0E00-\u0E7F]+", "", paper["title"].lower())
        if norm_title in seen_titles:
            prev_idx = seen_titles[norm_title]["index"]
            prev_file = seen_titles[norm_title]["file"]
            prev_prio = FORMAT_PRIORITY.get(Path(prev_file).suffix.lower(), 0)
            curr_prio = FORMAT_PRIORITY.get(paper_file.suffix.lower(), 0)

            if curr_prio > prev_prio:
                print(
                    f"⚠️ [DUPLICATE DETECTED] Replacing lower-priority '{prev_file}' with '{paper_file.name}' for '{paper['title']}'."
                )
                raw_papers_list[prev_idx] = paper
                seen_titles[norm_title]["file"] = paper_file.name
            else:
                print(
                    f"⚠️ [DUPLICATE DETECTED] Retaining existing '{prev_file}' over '{paper_file.name}' for '{paper['title']}'."
                )
        else:
            seen_titles[norm_title] = {
                "index": len(raw_papers_list),
                "file": paper_file.name,
            }
            raw_papers_list.append(paper)

    papers = raw_papers_list
    category_counts = {}
    tag_counts = {}

    for paper in papers:
        cat = paper["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
        for t in paper["tags"]:
            tag_counts[t] = tag_counts.get(t, 0) + 1

        print(f"📄 Processed: {paper['slug']} -> {len(paper['tags'])} tags assigned")

    # Sort tags by frequency
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)

    taxonomy = {
        "lastUpdated": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "totalPapers": len(papers),
        "categories": category_counts,
        "tags": [{"name": t, "count": c} for t, c in sorted_tags],
    }

    papers_file = data_dir / "papers.json"
    taxonomy_file = data_dir / "taxonomy.json"

    papers_file.write_text(
        json.dumps(papers, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    taxonomy_file.write_text(
        json.dumps(taxonomy, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\n✨ Generated {papers_file} with {len(papers)} unique papers.")
    print(f"✨ Generated {taxonomy_file} with {len(taxonomy['tags'])} unique tags.")


if __name__ == "__main__":
    main()
