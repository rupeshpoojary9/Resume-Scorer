# Resume Scorer 🚀

An AI-powered Applicant Tracking System (ATS) that helps HR professionals and recruiters instantly rank and analyze candidate resumes against specific job descriptions.

![Resume Scorer Dashboard](https://github.com/user-attachments/assets/placeholder-image) 
*(Note: You can add a screenshot here later)*

## ✨ Features

-   **Multi-Role Support**: Manage multiple job roles simultaneously.
-   **AI-Powered Scoring**: Uses OpenAI to analyze resumes against Job Descriptions (JDs) with deep semantic understanding.
-   **Instant Ranking**: Get a ranked list of candidates with scores (0-100) and verdicts (Highly Relevant, Relevant, etc.).
-   **Detailed Analysis**: View comprehensive reports for each candidate, including:
    -   Matching Skills
    -   Missing Skills
    -   Experience Relevance
    -   Red Flags
    -   AI-generated Summary
-   **Drag & Drop Interface**: Easy upload for JDs and Resumes (PDF, DOCX, TXT).
-   **Secure**: Your OpenAI API Key is stored locally in your browser.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Radix UI, Lucide React.
-   **Backend**: FastAPI (Python), SQLAlchemy, SQLite.
-   **AI**: OpenAI API (GPT-4o/GPT-3.5-turbo).

## 🚀 Setup Instructions

### Prerequisites
-   Python 3.8+
-   Node.js 16+
-   OpenAI API Key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory (optional, as you can enter the key in the UI):
```env
OPENAI_API_KEY=your_api_key_here
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

## 📖 How to Use

1.  **Enter API Key**: On the home page or dashboard, enter your OpenAI API Key. It will be saved locally.
2.  **Create a Role**: Click "Create New Role" and upload a Job Description file.
3.  **Upload Resumes**: Click on the created role card to enter the dashboard. Drag and drop candidate resumes.
4.  **Analyze**: Click "Analyze Candidates" to let the AI do its magic.
5.  **Review**: Check the ranked list and click "View" on any candidate for a detailed breakdown.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
