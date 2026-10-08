#!/usr/bin/env python3
"""
Content preparation and auto-tagging pipeline.
Parses markdown files in `raw_papers/` and compiles them into structured JSON
at `src/data/papers.json` and `src/data/taxonomy.json`.
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
    ],
    "CoffeeBody": ["บอดี้", "coffee body", "mouthcoating", "thickness", "สัมผัสในช่องปาก"],
    "Astringency": ["ความฝาด", "astringency", "แห้งสาก", "puckering"],
    "Melanoidins": ["เมลาโนอิดิน", "melanoidin", "melanoidins"],
    "RoastingChemistry": ["การคั่ว", "roasting", "roast", "อุณหพลศาสตร์", "first crack"],
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
    ],
    "Extraction": [
        "การสกัด",
        "extraction",
        "เอสเปรสโซ",
        "ดริป",
        "drip",
        "yield",
        "ช็อต",
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
    ],
    "FT-ICR-MS": ["ft-icr", "mass spectrometry", "แมสสเปกโทรเมตรี", "uplc-qqq-ms"],
}


def extract_metadata_table(text):
    metadata = {}
    table_match = re.search(
        r"## ข้อมูลงานวิจัย \(Research Metadata\)\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n((?:\|[^\n]+\|\s*\n)+)",
        text,
    )
    if table_match:
        rows = table_match.group(1).strip().split("\n")
        for row in rows:
            cols = [c.strip() for c in row.split("|")[1:-1]]
            if len(cols) >= 2:
                key = re.sub(r"[*_]", "", cols[0]).strip()
                val = cols[1].strip()
                if "ชื่อบทความวิจัย" in key:
                    metadata["englishTitle"] = val
                elif "คณะผู้วิจัย" in key:
                    metadata["authors"] = val
                elif "สถาบัน" in key:
                    metadata["institution"] = val
                elif "วารสารวิชาการ" in key:
                    metadata["journal"] = val
                elif "ลิงก์งานวิจัย" in key:
                    metadata["links"] = val
    return metadata


def parse_paper(file_path: Path):
    content = file_path.read_text(encoding="utf-8")
    slug = file_path.stem

    # Extract Title
    title = slug.replace("-", " ").title()
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()

    # Extract Date
    date_str = ""
    date_match = re.search(r"\*\*วันที่:\*\*\s*(.+)", content)
    if not date_match:
        date_match = re.search(r"วันที่:\s*([^\n]+)", content)
    if date_match:
        date_str = date_match.group(1).strip()

    # Extract Category
    category = "General Coffee Science"
    cat_match = re.search(r"\*\*หมวดหมู่:\*\*\s*(.+)", content)
    if not cat_match:
        cat_match = re.search(r"หมวดหมู่:\s*([^\n]+)", content)
    if cat_match:
        category = cat_match.group(1).strip()

    # Extract Research Metadata Table
    meta = extract_metadata_table(content)

    # Use english research paper title if available for display
    display_title = meta.get("englishTitle") or title

    # Extract Excerpt (from Section 1)
    excerpt = ""
    sec1_match = re.search(
        r"## 1\. วัตถุประสงค์และที่มาของงานวิจัย\s*\n\s*(.+?)(?=\n\n|\n##)", content, re.DOTALL
    )
    if sec1_match:
        cleaned = re.sub(r"[*_#]", "", sec1_match.group(1)).strip()
        excerpt = cleaned[:240] + ("..." if len(cleaned) > 240 else "")

    # Auto-Tagging
    content_lower = content.lower()
    matched_tags = []
    for tag, keywords in TAXONOMY_RULES.items():
        if any(kw.lower() in content_lower for kw in keywords):
            matched_tags.append(tag)

    # Basic word count and reading time
    word_count = len(re.findall(r"\w+", content))
    reading_time = max(1, round(word_count / 180))

    return {
        "id": slug,
        "slug": slug,
        "title": display_title,
        "documentHeader": title,
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
        "content": content,
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

    for md_file in sorted(raw_dir.glob("*.md")):
        if md_file.name.startswith("."):
            continue
        paper = parse_paper(md_file)

        # Deduplication check: if a paper with identical title exists, keep the latest
        norm_title = re.sub(r"[^\w\u0E00-\u0E7F]+", "", paper["title"].lower())
        if norm_title in seen_titles:
            print(
                f"⚠️ [DUPLICATE DETECTED] '{paper['title']}' in '{md_file.name}' already loaded from '{seen_titles[norm_title]['file']}'. Keeping latest."
            )
            # replace or merge
            prev_idx = seen_titles[norm_title]["index"]
            raw_papers_list[prev_idx] = paper
            seen_titles[norm_title]["file"] = md_file.name
        else:
            seen_titles[norm_title] = {
                "index": len(raw_papers_list),
                "file": md_file.name,
            }
            raw_papers_list.append(paper)

    papers = raw_papers_list
    category_counts = {}
    tag_counts = {}

    for paper in papers:
        # Count categories
        cat = paper["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

        # Count tags
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

    print(f"\n✨ Generated {papers_file} with {len(papers)} papers.")
    print(f"✨ Generated {taxonomy_file} with {len(taxonomy['tags'])} unique tags.")


if __name__ == "__main__":
    main()
