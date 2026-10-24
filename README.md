# NTWK Coffee Science — Deep Research Portal ☕️🔬

คลังความรู้และพอร์ทัลวิเคราะห์งานวิจัยวิทยาศาสตร์กาแฟเชิงลึก (**Coffee Science Deep Research**) ซิงค์ข้อมูลอัตโนมัติจาก **Google Drive** ผ่าน **GitHub Actions** ทุกวันเวลา **12:17 น. (เวลาไทย)** พร้อมระบบวิเคราะห์จัดแท็กอัตโนมัติ (Taxonomy Engine) บนผืนกระดาษ Cream Paper สไตล์ Minimal Editorial พร้อมการยศาสตร์การอ่านทางวิทยาศาสตร์

[![Deploy Web App](https://github.com/NTWKKM/ntwcoff/actions/workflows/deploy.yml/badge.svg)](https://github.com/NTWKKM/ntwcoff/actions/workflows/deploy.yml)
[![Sync Content](https://github.com/NTWKKM/ntwcoff/actions/workflows/sync.yml/badge.svg)](https://github.com/NTWKKM/ntwcoff/actions/workflows/sync.yml)
[![Live Site](https://img.shields.io/badge/Live%20Portal-ntwkkm.github.io%2Fntwcoff-ff6f1e?style=flat&logo=safari)](https://ntwkkm.github.io/ntwcoff/)
[![License](https://img.shields.io/badge/License-MIT-charcoal)](LICENSE)

---

## 🌟 ฟังก์ชันการทำงานหลัก (Core Capabilities)

### 1. ระบบ CI/CD แยกส่วน & ซิงค์คลาวด์อัจฉริยะ (Decoupled, Off-Peak & Idempotent Sync Pipeline)
- **Automated Drive Sync Action (`sync.yml`)**: ซิงค์ข้อมูลงานวิจัยอัตโนมัติจาก Google Drive ทุกวันเวลา **12:17 น. ICT** (`05:17 UTC`) เลี่ยงช่วงต้นชั่วโมงเพื่อลดคิวสะสมของ GitHub Actions Runner
- **Single Concurrency & Resilient Rebase**: ควบคุม Concurrency (`group: sync-gdrive`) และใช้ `git pull --rebase origin main` ก่อน Push
- **Content-Aware Idempotency**: `scripts/prep_content.py` เปรียบเทียบเนื้อหาและโครงสร้าง Taxonomy ก่อนบันทึกทับ หากไม่มีข้อมูลเปลี่ยนแปลงจะคงค่า `taxonomy.lastUpdated` เดิมไว้เพื่อไม่ให้เกิด Empty Commit
- **Smart Manifest Cache (`.sync_manifest.json`)**: ตรวจสอบ `modifiedTime` ของไฟล์บน Google Drive เพื่อข้ามการดาวน์โหลดไฟล์ที่ไม่ได้แก้ไข (`[UNCHANGED]`)

---

### 2. ระบบป้องกันไฟล์และข้อมูลซ้ำ 4 ชั้น (4-Layer Anti-Duplication Engine)
- **Layer 1 (File Storage)**: บันทึกทับไฟล์เดิมในพาธ `raw_papers/<file_name>.md` ทันที
- **Layer 2 (Drive Collision Resolution)**: กรณีมีหลายไฟล์ใน Google Drive ที่ตั้งชื่อซ้ำกันแต่คนละ File ID ระบบจะเติม Short ID (`_{id[:6]}`) กำกับอัตโนมัติ
- **Layer 3 (Authoritative Title Extraction)**: ดึงชื่อบทความวิจัยฉบับเต็มจากตาราง Metadata (`ชื่อบทความวิจัย`) เป็นหลัก ก่อนใช้ชื่อไฟล์เป็น Fallback
- **Layer 4 (Latest Monograph Retention)**: ตรวจจับหัวข้องานวิจัยซ้ำด้วย Normalized Title Matching และเลือกเก็บ **ฉบับล่าสุดและมีเนื้อหาละเอียดที่สุด** ไว้เพียง 1 รายการใน `papers.json`

---

### 3. ระบบจำแนกหมวดหมู่และจัดแท็กอัตโนมัติ (Coffee Science Taxonomy Engine)
ประมวลผลเนื้อหางานวิจัยผ่าน `scripts/prep_content.py` แบ่งเป็น 4 สาขาหลัก และติดแท็กอัตโนมัติตาม Keyword Ontology กว่า 20 หมวด:
- **กลิ่นรสและประสาทสัมผัส**: `#SensoryScience`, `#CoffeeBody`, `#Astringency`, `#Q-Grader`, `#Tribology`
- **เคมีและอุณหพลศาสตร์การคั่ว**: `#RoastingChemistry`, `#MaillardReaction`, `#SucrosePyrolysis`, `#Melanoidins`, `#Acrylamide`, `#5-HMF`, `#Phenolics`
- **การสกัดและฟิสิกส์การชง**: `#Extraction`, `#WaterChemistry`, `#GrindingPhysics`, `#KineticModeling`
- **การแปรรูป ชีววิทยา และความปลอดภัยอาหาร**: `#Fermentation`, `#SpecialtyCoffee`, `#FoodSafety`, `#FT-ICR-MS`

---

### 4. ประสบการณ์การอ่านและการยศาสตร์ทางวิทยาศาสตร์ (Minimal Editorial & Reading Ergonomics)
- **Warm Editorial Paper Canvas**: พื้นหลังกระดาษสีครีม Cream Paper (`#fdfbf9`), ตัวอักษรสีถ่าน Charcoal (`#171717`), หัวข้อสีหมึกโกโก้ Cocoa Ink (`#2b1a07`), พื้นผิวรอง Dew Drop (`#f7efe9`), และไฮไลต์สีส้ม Marker Orange (`#ff6f1e`) พร้อมโหมดมืด (Dark Mode) แบบ Zero-FOUC
- **Single-Pass Scientific Markdown & KaTeX Engine**:
  - ประมวลผลทั้ง HTML เนื้อหาและสารบัญ (`TocItem[]`) ในรอบเดียวผ่าน `parsePaperMarkdown`
  - แยกบล็อกสมการคณิตศาสตร์ (`$...$` และ `$$...$$`) ออกจาก Markdown ทั่วไป ป้องกันสัญลักษณ์ทางวิทยาศาสตร์ (เช่น `C.I.E. L*a*b*`, `B3LYP/6-311G**`, `%` ในสมการ) ตีกับตัวเอียง/ตัวหนา
  - ไฮไลต์ตัวแปรการทดลองทางวิทยาศาสตร์เป็นชิปพารามิเตอร์ (`.param-badge`) ด้วยฟอนต์ Tabular Monospace อัตโนมัติ (เช่น `92 °C`, `4 นาที`, `300 mg/L`, `38.8 kHz`)
- **Monograph Reader (`<dialog closedby="any">`)**:
  - คอลัมน์อ่านหนังสือควบคุมความกว้าง (`Focus` 64ch / `Standard` 70ch) และปรับขนาดตัวอักษรได้ 3 ระดับ (`A-`, `A`, `A+`)
  - สารบัญอัตโนมัติ (Sticky TOC บน Desktop และลิ้นชัก TOC บนหน้าจอขนาดเล็ก) พร้อม `IntersectionObserver` Scrollspy
  - แปลงรหัสอ้างอิง DOI (`10.xxxx/...`), PMCID (`PMC...`), และ `PMID` ในข้อมูลงานวิจัยให้เป็นลิงก์คลิกไปยังต้นฉบับได้ทันที พร้อมปุ่มคัดลอกรายการอ้างอิง (`Cite`)
  - รองรับ Deep Linking ผ่าน URL Hash (`#paper=<slug>`)

---

## 📂 โครงสร้างไดเรกทอรี (Directory Structure)

```
ntwcoff/
├── .github/workflows/
│   ├── sync.yml                  # GitHub Actions Cron 12:17 ICT (Google Drive Sync & Content Prep)
│   └── deploy.yml                # Build Vite & Deploy Web Application to GitHub Pages
├── scripts/
│   ├── sync_drive.py             # ดึงไฟล์จาก Google Drive และจัดการ Manifest Cache
│   └── prep_content.py           # สกัด Metadata, ซ่อมแซม Markdown, ลบงานวิจัยซ้ำ, สร้าง JSON
├── raw_papers/                   # คลังเอกสารวิจัยต้นฉบับ Markdown
├── src/
│   ├── components/
│   │   ├── Navbar.tsx            # แถบนำทางส่วนบนและปุ่มสลับธีม Light/Dark
│   │   ├── HeroBanner.tsx        # ส่วนหัว Minimal Editorial พร้อมจำนวนงานวิจัยและสาขาวิชา
│   │   ├── FilterBar.tsx         # แถบค้นหา, ตัวกรองปีที่ตีพิมพ์, หมวดหมู่สาขาวิชา และลิ้นชัก Keywords
│   │   ├── PaperCard.tsx         # การ์ดงานวิจัย 2 คอลัมน์ พร้อม Deferred Rendering
│   │   ├── PaperReader.tsx       # หน้าต่างอ่านงานวิจัย (<dialog>), สารบัญ TOC และข้อมูลอ้างอิงคลิกได้
│   │   └── KatexRenderer.tsx     # ตัวพาร์ส Markdown & KaTeX แบบ Single-pass
│   ├── data/
│   │   ├── papers.json           # ข้อมูลงานวิจัยที่ผ่านการคัดกรองและจัดเรียงแล้ว
│   │   └── taxonomy.json         # สถิติหมวดหมู่ ปีที่ตีพิมพ์ และแท็กทั้งหมด
│   ├── types.ts                  # โครงสร้าง Type Definitions (TypeScript)
│   ├── App.tsx                   # คอมโพเนนต์หลักและระบบกรองข้อมูล
│   └── index.css                 # Design Tokens, KaTeX & Table Styles
├── ARCHITECTURE.md               # Structural Diary
├── CONTEXT.md                    # Domain Ontology Diary
├── DESIGN.md                     # Architectural Decision Records
└── package.json
```

---

## 🚀 การติดตั้งและพัฒนาในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ประมวลผลเอกสารวิจัยใน raw_papers/ เป็น JSON
npm run prep

# 3. รันเซิร์ฟเวอร์สำหรับพัฒนา (พอร์ต 3000)
npm run dev

# 4. บิลด์ Production Bundle
npm run build
```
