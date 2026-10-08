# NTWK Coffee Science — Deep Research Portal ☕️🔬

คลังความรู้และพอร์ทัลวิเคราะห์งานวิจัยวิทยาศาสตร์กาแฟเชิงลึก (**Coffee Science Deep Research**) ซิงค์ข้อมูลอัตโนมัติจาก **Google Drive** และปรับโครงสร้างพร้อมแท็กหมวดหมู่อัตโนมัติ แสดงผลบนหน้าเว็บสไตล์ Bauhaus Editorial

[![Sync & Deploy](https://github.com/NTWKKM/ntwcoff/actions/workflows/sync.yml/badge.svg)](https://github.com/NTWKKM/ntwcoff/actions/workflows/sync.yml)
[![Live Site](https://img.shields.io/badge/Live%20Portal-ntwkkm.github.io%2Fntwcoff-d97706?style=flat&logo=safari)](https://ntwkkm.github.io/ntwcoff/)

---

## 🌟 ฟีเจอร์หลัก (Core Features)

- **Automated Sync**: ดึงบทความจาก Google Drive อัตโนมัติทุกวันเวลา 12:00 น. (ICT) ผ่าน GitHub Actions
- **Smart Data Deduplication**: ตรวจสอบการแก้ไขด้วย Manifest Cache และป้องกันไฟล์ซ้ำซ้อน 4 ชั้น (4-Layer Anti-Duplication Engine)
- **Auto-Tagging System**: วิเคราะห์เนื้อหาและติดแท็กตามหมวดหมู่วิทยาศาสตร์กาแฟ (เช่น `#SensoryScience`, `#RoastingChemistry`) อัตโนมัติ
- **Modern Editorial UI**: หน้าเว็บแบบ Bauhaus Studio Notebook ที่สะอาดตา อ่านง่าย พร้อมรองรับ KaTeX สำหรับสมการเคมีและคณิตศาสตร์
- **Fast & Precise Search**: ค้นหาบทความ ชื่อสารเคมี ผู้แต่ง หรือแท็กแบบ Real-time

---

## 🔄 ภาพรวมระบบ (Architecture Overview)

```mermaid
flowchart LR
    GD[Google Drive] -->|Sync & Cache| GHA[GitHub Actions]
    GHA -->|Extract & Tag| JSON[JSON Data]
    JSON -->|Build| WEB[Vite + React SPA]
    WEB -->|Deploy| GHP[GitHub Pages]
```

---

## 💻 Tech Stack

- **Data Pipeline**: Python 3, Google Drive API
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS 3
- **Deployment**: GitHub Actions, GitHub Pages
