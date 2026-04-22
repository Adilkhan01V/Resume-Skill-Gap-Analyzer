# 🚀 AI Resume Skill Gap Analyzer

**Optimize your career journey with AI-powered insights, real-time scoring, and intelligent resume enhancements.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://resume-skill-gap.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ Overview

The **AI Resume Skill Gap Analyzer** is a sophisticated career assistant designed to bridge the gap between your current resume and your target job roles. By leveraging advanced AI (Gemini 3 Flash), it provides a comprehensive analysis of your skills, identifies critical gaps, and generates actionable improvements to make you a top candidate.

### 🌟 Key Features

- **⚡ Lightning-Fast Analysis**: Instant resume parsing (PDF/DOCX) and scoring against target job descriptions.
- **🧠 Intelligent Skill Gap Detection**: Automatically extracts skills from your resume and compares them with industry requirements.
- **🪄 AI Resume Improver**: One-click professional rephrasing of your experience and projects to highlight missing skills effectively.
- **📊 Real-time Scoring**: Interactive dashboard with overall match scores and section-by-section breakdown (ATS, Semantic, Evidence).
- **🛤️ Career Roadmap**: AI-generated learning paths and suggestions to help you acquire missing skills.
- **📁 Persistent Workspace**: Your analysis history and improved resumes are saved automatically, allowing you to pick up where you left off.
- **📄 Professional Export**: Export your optimized resume to PDF or DOCX with professional formatting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Vanilla CSS (Modern CSS Variables & Glassmorphism)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **AI Engine**: Google Gemini 3 Flash
- **PDF Parsing**: PyMuPDF (fitz)
- **Export Engine**: WeasyPrint / python-docx

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adilkhan01V/Resume-Skill-Gap-Analyzer.git
   cd Resume-Skill-Gap-Analyzer
   ```

2. **Backend Setup**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── client/                # React Frontend
│   ├── src/components/    # UI Components (Dashboard, Common, Layout)
│   ├── src/hooks/         # Custom React Hooks
│   ├── src/pages/         # Route Pages (Landing, Dashboard, History)
│   └── src/services/      # API & Storage Services
├── server/                # FastAPI Backend
│   ├── app/api/           # API Endpoints
│   ├── app/services/      # Core Logic (Parser, AI, Scoring)
│   └── app/schemas/       # Pydantic Data Models
└── docs/                  # Technical Documentation
```

---

## 🌐 Live Link
Access the application here: [https://resume-skill-gap.vercel.app/](https://resume-skill-gap.vercel.app/)

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Developed with ❤️ for better careers.*
