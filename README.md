# SchemeSathi AI

SchemeSathi AI is a citizen scheme advisory portal that helps Indian citizens discover government welfare schemes they may qualify for, understand eligibility criteria and required documents, and follow a clear step-by-step action plan to apply on official government portals.

---

## 🛠️ Project Structure

```
SchemeSathi-AI/
├── backend/                # Node.js + Express Backend
│   ├── src/
│   │   ├── agents/         # 6-Agent AI Advisory Workflow
│   │   │   ├── orchestratorAgent.js
│   │   │   ├── discoveryAgent.js
│   │   │   ├── eligibilityAgent.js
│   │   │   ├── documentAgent.js
│   │   │   ├── verificationAgent.js
│   │   │   └── actionPlannerAgent.js
│   │   ├── config/         # Supabase & SDK configs
│   │   ├── services/       # Database & Gemini services
│   │   └── server.js       # Express server & /api/assessment
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/               # React.js + Vite Frontend
│   ├── src/
│   │   ├── components/     # Clean Citizen UI Components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProfileForm.jsx
│   │   │   ├── AnalysisLoading.jsx
│   │   │   ├── ResultsView.jsx
│   │   │   └── ErrorView.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── .gitignore              # Root gitignore protecting secrets & build artifacts
```

---

## 🚀 Getting Started

### 1. Backend Setup

1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_google_gemini_api_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Privacy

- Sensitive environment variables (`.env`) containing API keys and database credentials are excluded from version control.
- All scheme guidelines, benefits, and links are verified against official government records to prevent hallucinations.
