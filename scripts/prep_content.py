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
    k_clean = key.strip()
    k_lower = k_clean.lower()
    if "ชื่อบทความวิจัย" in k_clean and not meta.get("englishTitle"):
        meta["englishTitle"] = val
    elif ("คณะผู้วิจัย" in k_clean or "ผู้วิจัย" in k_clean) and not meta.get("authors"):
        meta["authors"] = val
    elif ("สถาบัน" in k_clean or "หน่วยงาน" in k_clean) and not meta.get("institution"):
        meta["institution"] = val
    elif "วารสารวิชาการ" in k_clean and not meta.get("journal"):
        meta["journal"] = val
    elif "ลิงก์งานวิจัย" in k_clean and not meta.get("links"):
        meta["links"] = val
    elif (
        any(k in k_clean for k in ["ปีที่ตีพิมพ์", "ปีที่เผยแพร่", "ปีพิมพ์"])
        or k_clean == "ปี"
        or k_lower in ["publication year", "published year", "year"]
    ) and not meta.get("publishedYear"):
        meta["publishedYear"] = val


def extract_metadata(text: str, slug: str = "") -> dict:
    metadata = {}

    # 1. Filename pattern: e.g. [2026-09-05] The Role of Dissolved Cations in Coffee Extraction
    fn_match = re.match(r"^\[(\d{4}-\d{2}-\d{2})\]\s*(.+)$", slug)
    if fn_match:
        metadata["dateFromFilename"] = fn_match.group(1)
        metadata["englishTitle"] = fn_match.group(2).strip()

    # Scope metadata extraction to the header block before Section 1
    sec1_match = re.search(
        r"(?:^|\n)\s*(?:##\s*)?1\.\s*(?:วัตถุประสงค์|บทนำ|ที่มา|ความสำคัญ|ภาพรวม|บทคัดย่อ|จุดประสงค์)[^\n]*",
        text,
    )
    meta_text = text[: sec1_match.start()] if sec1_match else text

    # 2. Markdown Table Pattern
    table_match = re.search(
        r"## ข้อมูลงานวิจัย.*?\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)",
        meta_text,
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
    bullet_matches = re.findall(
        r"^[*\-•]\s*([^\n:]+):\s*([^\n]+)", meta_text, re.MULTILINE
    )
    for k, v in bullet_matches:
        _assign_meta(metadata, k.strip(), v.strip())

    # 4. Google Docs plain text / tab format
    gdoc_matches = re.findall(
        r"(ชื่อบทความวิจัย|คณะผู้วิจัย|ผู้วิจัย|สถาบัน|หน่วยงาน|วารสารวิชาการ|ลิงก์งานวิจัย|ปีที่ตีพิมพ์|ปีที่เผยแพร่|ปีพิมพ์|Published Year|Year)\s*\n\s*([^\n]+)",
        meta_text,
    )
    for k, v in gdoc_matches:
        _assign_meta(metadata, k.strip(), v.strip())

    header_year = re.search(
        r"^(?:ปีที่ตีพิมพ์|ปีที่เผยแพร่|ปีพิมพ์|Published Year|Year):\s*([^\n]+)",
        meta_text,
        re.MULTILINE | re.IGNORECASE,
    )
    if header_year and not metadata.get("publishedYear"):
        metadata["publishedYear"] = header_year.group(1).strip()

    return metadata


def extract_published_year(journal_str: str, year_meta_str: str = "") -> int | None:
    if journal_str:
        m = re.search(r"\b(19\d{2}|20\d{2})\b", journal_str)
        if m:
            return int(m.group(1))
    if year_meta_str:
        m = re.search(
            r"(?:ตีพิมพ์|เผยแพร่|published|year).*?\b(19\d{2}|20\d{2})\b",
            year_meta_str,
            re.IGNORECASE,
        )
        if m:
            return int(m.group(1))
        m = re.search(r"\b(19\d{2}|20\d{2})\b", year_meta_str)
        if m:
            return int(m.group(1))
    return None


def normalize_category(cat: str) -> str:
    c = cat.strip()
    c_lower = c.lower()
    if "สกัด" in c or "brewing" in c_lower or "extraction" in c_lower:
        return "การสกัดและการชง (Brewing & Extraction)"
    if "กลิ่นรส" in c or "sensory" in c_lower or "flavor" in c_lower:
        return "กลิ่นรสและประสาทสัมผัส (Sensory & Flavor)"
    if "คั่ว" in c or "roasting" in c_lower or "thermodynamics" in c_lower:
        return "เคมีและฟิสิกส์การคั่ว (Roasting Science)"
    if (
        "หมัก" in c
        or "แปรรูป" in c
        or "fermentation" in c_lower
        or "processing" in c_lower
    ):
        return "การแปรรูปและการหมัก (Processing & Fermentation)"
    return c


def clean_paper_content(content: str) -> str:
    content = content.lstrip("\ufeff")
    # Find start of section 1 (restrict to genuine first-section headings, avoiding arbitrary numbered items)
    m = re.search(
        r"(?:^|\n)\s*(?:##\s*)?1\.\s*(?:วัตถุประสงค์|บทนำ|ที่มา|ความสำคัญ|ภาพรวม|บทคัดย่อ|จุดประสงค์)[^\n]*",
        content,
    )
    if m:
        content = content[m.start() :].strip()

    # Remove mock signature / metadata at bottom
    content = re.sub(r"\n+(?:ลงชื่อผู้ตรวจสอบรายงาน|สถานที่จัดทำเอกสาร):[^\n]*", "", content)

    # Standardize main section headings with markdown '## '
    content = re.sub(
        r"(?:^|\n)\s*(?:##\s*)?1\.\s*((?:วัตถุประสงค์|บทนำ|ที่มา|ความสำคัญ|ภาพรวม|บทคัดย่อ|จุดประสงค์)[^\n]*)",
        r"\n\n## 1. \1\n\n",
        content,
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

    # Clean body content to strip redundant preamble metadata
    cleaned_body = clean_paper_content(content)

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
    category = normalize_category(category)

    # Extract Published Year from Journal or Publication Year Metadata
    published_year = extract_published_year(
        meta.get("journal", ""),
        meta.get("publishedYear", ""),
    )

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

    # Extract Excerpt (derived from Section 1 of cleaned_body)
    excerpt = ""
    sec1_match = re.search(
        r"(?:##\s*)?1\.\s*วัตถุประสงค์และที่มาของงานวิจัย\s*\n\s*(.+?)(?=\n\n|\n\d\.|\n##)",
        cleaned_body,
        re.DOTALL,
    )
    if sec1_match:
        cleaned = re.sub(r"[*_#]", "", sec1_match.group(1)).strip()
        excerpt = cleaned[:240] + ("..." if len(cleaned) > 240 else "")
    else:
        # Fallback excerpt: first substantial paragraph of cleaned_body
        paragraphs = [
            p.strip() for p in cleaned_body.split("\n\n") if len(p.strip()) > 80
        ]
        if paragraphs:
            cleaned = re.sub(r"[*_#]", "", paragraphs[0]).strip()
            excerpt = cleaned[:240] + ("..." if len(cleaned) > 240 else "")

    # Auto-Tagging (searches full content so no metadata keywords are missed)
    content_lower = content.lower()
    matched_tags = []
    for tag, keywords in TAXONOMY_RULES.items():
        if any(kw.lower() in content_lower for kw in keywords):
            matched_tags.append(tag)

    # Word count and reading time (derived from cleaned_body so removed preamble text is excluded)
    word_count = len(re.findall(r"\w+", cleaned_body))
    reading_time = max(1, round(word_count / 180))

    return {
        "id": slug,
        "slug": slug,
        "title": title,
        "documentHeader": doc_header,
        "date": date_str,
        "publishedYear": published_year,
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

    # Default sort: latest published year first (descending), followed by sync date
    raw_papers_list.sort(
        key=lambda p: (
            p.get("publishedYear") or 0,
            p.get("date") or "",
            p.get("title") or "",
        ),
        reverse=True,
    )

    papers = raw_papers_list
    category_counts = {}
    tag_counts = {}
    year_counts = {}

    for paper in papers:
        cat = paper["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
        for t in paper["tags"]:
            tag_counts[t] = tag_counts.get(t, 0) + 1
        yr = paper.get("publishedYear")
        if yr:
            year_counts[yr] = year_counts.get(yr, 0) + 1

        print(
            f"📄 Processed: {paper['slug']} -> Year: {paper.get('publishedYear')}, {len(paper['tags'])} tags assigned"
        )

    # Sort tags by frequency
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
    tags_list = [{"name": t, "count": c} for t, c in sorted_tags]

    # Sort publication years latest first
    sorted_years = sorted(year_counts.items(), key=lambda x: x[0], reverse=True)
    years_list = [{"year": y, "count": c} for y, c in sorted_years]

    papers_file = data_dir / "papers.json"
    taxonomy_file = data_dir / "taxonomy.json"

    # Check if content has actually changed compared to existing files
    new_papers_json = json.dumps(papers, ensure_ascii=False, indent=2)
    papers_changed = True
    if papers_file.exists():
        try:
            if papers_file.read_text(encoding="utf-8") == new_papers_json:
                papers_changed = False
        except Exception:
            papers_changed = True

    existing_taxonomy = {}
    if taxonomy_file.exists():
        try:
            existing_taxonomy = json.loads(taxonomy_file.read_text(encoding="utf-8"))
        except Exception:
            existing_taxonomy = {}

    tax_changed = (
        existing_taxonomy.get("totalPapers") != len(papers)
        or existing_taxonomy.get("categories") != category_counts
        or existing_taxonomy.get("years") != years_list
        or existing_taxonomy.get("tags") != tags_list
    )

    # Preserve lastUpdated timestamp if content is identical (prevents empty daily commits)
    if not papers_changed and not tax_changed and existing_taxonomy.get("lastUpdated"):
        last_updated = existing_taxonomy["lastUpdated"]
    else:
        last_updated = datetime.datetime.now(datetime.timezone.utc).isoformat()

    taxonomy = {
        "lastUpdated": last_updated,
        "totalPapers": len(papers),
        "categories": category_counts,
        "years": years_list,
        "tags": tags_list,
    }

    papers_file.write_text(new_papers_json, encoding="utf-8")
    taxonomy_file.write_text(
        json.dumps(taxonomy, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"\n✨ Generated {papers_file} with {len(papers)} unique papers.")
    print(f"✨ Generated {taxonomy_file} with {len(taxonomy['tags'])} unique tags.")
    if not papers_changed and not tax_changed:
        print("ℹ️ Content unchanged. Preserved lastUpdated timestamp (idempotent run).")


if __name__ == "__main__":
    main()
