# e42 Foundry 🚀

**e42 Foundry** is an internal platform designed to automate processes and empower the e42 team with AI-driven tools. It serves as a central hub for productivity applications that streamline recruitment, project management, and market intelligence.

## 📦 Included Applications

### 1. Resume Scorer
An AI-powered Applicant Tracking System (ATS) that helps HR professionals instantly rank and analyze candidate resumes.
-   **Features**: Semantic scoring against JDs, detailed skill gap analysis, and instant candidate ranking.

### 2. GitLab Tracker
A comprehensive project management dashboard for engineering teams.
-   **Features**: Real-time issue tracking, "Missing Time" alerts for daily compliance, and a visual status breakdown of the development pipeline.

### 3. Neil (Competitive Intelligence)
An autonomous AI agent for deep-dive market research.
-   **Features**: Automated competitor discovery, SWOT analysis, "Battle Cards" for sales enablement, and risk/strategy radar charts.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Radix UI, Lucide React.
-   **Backend**: FastAPI (Python), SQLAlchemy, SQLite.
-   **AI**: OpenAI API (GPT-4o) & LangChain.

## 🚀 Setup Instructions

### Prerequisites
-   Python 3.12+
-   Node.js 20+
-   OpenAI API Key
-   GitLab Access Token (for Tracker)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
OPENAI_API_KEY=your_key
GEMINI_API_KEY=your_key
GITLAB_TOKEN=your_token
GITLAB_URL=https://gitlab.example.com
```

Run the server:
```bash
uvicorn main:app --reload --port 8001
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🐳 Docker Deployment

To run the entire suite in production:

```bash
docker-compose up --build -d
```
-   **Frontend**: Port 8081
-   **Backend**: Port 8003

## 🤝 Contributing

This is an internal tool for e42. Please follow the standard contribution guidelines for the product team.
