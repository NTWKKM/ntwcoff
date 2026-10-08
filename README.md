# NTWK Coffee Science — Deep Research Portal ☕️🔬

คลังความรู้และพอร์ทัลวิเคราะห์งานวิจัยวิทยาศาสตร์กาแฟเชิงลึก (**Coffee Science Deep Research**) ซิงค์ข้อมูลอัตโนมัติจาก **Google Drive** ผ่าน **GitHub Actions** ทุกวันเวลา **12:00 น. (เวลาไทย)** พร้อมระบบจัด Tag อัตโนมัติ (Taxonomy Engine) และเว็บแอปพลิเคชันสไตล์ Modern Editorial พร้อมการแสดงผลสมการคณิตศาสตร์และสูตรเคมี (KaTeX)

---

## 🌟 จุดเด่นของระบบ (Key Features)

- **Automated Cloud Sync**: ดึงไฟล์งานวิจัย (`.md`, `.txt`, หรือ Google Docs) จาก Google Drive โดยใช้ Google Cloud Service Account อัตโนมัติทุกวันเวลา 12:00 น. ICT (`05:00 UTC`) หรือกดรันมือได้ทันทีผ่าน `workflow_dispatch`
- **Coffee Science Taxonomy & Auto-Tagging**: จำแนกหัวข้องานวิจัยและติดแท็กอัตโนมัติ (เช่น `#SensoryScience`, `#RoastingChemistry`, `#Melanoidins`, `#Acrylamide`, `#5-HMF`, `#SpecialtyCoffee`, `#Extraction`, `#Q-Grader`, `#Tribology`, ฯลฯ)
- **Modern Research Reader UI**:
  - รองรับ Dark / Light Mode (โทนสี Deep Espresso, Warm Amber และฟอนต์ที่อ่านง่ายสบายตาตามหลัก Ergonomic Contrast)
  - ค้นหาแบบเรียลไทม์ (Live Search by keyword, chemical compound, author, journal)
  - ตัวกรอง Category และ Tag Cloud แบบ Interactive
  - หน้าต่างอ่านบทความฉบับเต็ม พร้อม Table of Contents, การ์ดข้อมูลจำเพาะงานวิจัย (Metadata Specifications), และปุ่มคัดลอก Citation
  - รองรับสูตรคณิตศาสตร์และสมการเคมีด้วย **KaTeX** (\$HMW > 5\\text{ kDa}\$, \$m/z\$, \$C_{21}H_{21}O_7\$, ฯลฯ)

---

## 📋 คำแนะนำการตั้งค่า Secrets (ขั้นตอนที่ 3)

เพื่อให้ GitHub Actions สามารถเชื่อมต่อไปยังโฟลเดอร์ Google Drive ได้ ให้ทำตามขั้นตอนดังนี้:

1. ไปที่เมนู **Settings** ของ GitHub Repository นี้ (`NTWKKM/ntwcoff`)
2. ในแถบด้านซ้าย เลือก **Secrets and variables** > **Actions**
3. คลิกปุ่ม **New repository secret** เพื่อสร้าง Secrets 2 ตัว:
   - **`GDRIVE_SERVICE_ACCOUNT_KEY`**: นำเนื้อหาทั้งหมดในไฟล์ JSON ของ Service Account Key มาวาง (รวมถึงเครื่องหมายปีกกา `{ ... }`)
   - **`GDRIVE_FOLDER_ID`**: นำ ID ของโฟลเดอร์ Google Drive มาวาง (เช่น ค่าที่อยู่หลัง `https://drive.google.com/drive/folders/<FOLDER_ID>`)
4. ตรวจสอบว่าใน Google Drive ได้ทำการกด **Share** โฟลเดอร์นั้นให้กับอีเมล `client_email` ของ Service Account แล้ว (สิทธิ์ Viewer หรือ Editor)

---

## 🌐 การเปิดใช้งาน GitHub Pages

เพื่อให้เว็บไซต์เผยแพร่เป็นเว็บจริง:
1. ไปที่ **Settings** > **Pages**
2. ภายใต้หัวข้อ **Build and deployment**:
   - **Source**: ให้เลือกเป็น **GitHub Actions**
3. เมื่อ Action รันสำเร็จ เว็บไซต์จะออนไลน์ทันทีที่:
   👉 **`https://ntwkkm.github.io/ntwcoff/`**

---

## ⏰ กำหนดการซิงค์ข้อมูล (Schedule)

- **ความถี่**: ทุกวันเวลา **12:00 น. เวลาไทย (ICT, UTC+7)**
- **Cron Expression**: `0 5 * * *` (05:00 UTC)
- **การรันมือ (Manual Trigger)**: ไปที่แท็บ **Actions** > เลือก **Sync Content from Google Drive & Deploy Portal** > กดปุ่ม **Run workflow**

---

## 💻 การทดสอบและรันบนเครื่อง Local

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. รันระบบประมวลผลเนื้อหาและจัดแท็ก (แปลง raw_papers/*.md สู่ JSON)
python3 scripts/prep_content.py

# 3. เริ่มรันเว็บเซิร์ฟเวอร์
npm run dev

# 4. ทดสอบ Build เว็บไซต์
npm run build
```

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
ntwcoff/
├── .github/workflows/
│   └── sync.yml              # GitHub Actions Cron 12:00 น. + Build & Deploy Pages
├── scripts/
│   ├── sync_drive.py         # ดาวน์โหลดไฟล์จาก Google Drive (ปลอดภัย มี Graceful fallback)
│   └── prep_content.py       # Auto-Tagging & Metadata Parser สร้าง src/data/papers.json
├── raw_papers/               # เอกสารต้นฉบับ Markdown ที่ sync มาจาก Drive
│   ├── coffee-astringency-melanoidin.md
│   └── coffee-roasting-5hmf-acrylamide.md
├── src/
│   ├── components/           # Navbar, HeroBanner, FilterBar, PaperCard, PaperReader, KatexRenderer
│   ├── data/                 # papers.json & taxonomy.json
│   ├── types.ts              # Data interfaces
│   ├── App.tsx               # Main Portal Layout & State Management
│   └── index.css             # Tailwind CSS & Typography
└── README.md
```
