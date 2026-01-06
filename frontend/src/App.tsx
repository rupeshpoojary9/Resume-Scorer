
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ApiKeyProvider } from '@/contexts/ApiKeyContext';
import FoundryHome from '@/pages/FoundryHome';
import ResumeScorerHome from '@/apps/resume-scorer/HomePage';
import Dashboard from '@/apps/resume-scorer/Dashboard';
import GitLabTracker from '@/apps/gitlab-tracker/GitLabTracker';
import NeilHome from '@/apps/neil/NeilHome';
import CompetitiveAnalysis from '@/apps/neil/CompetitiveAnalysis';
import InfiniteTalkHome from '@/apps/infinitetalk/InfiniteTalkHome';
import { Toaster } from "@/components/ui/toaster"
import { Chatbot } from "@/components/Chatbot"

function AppContent() {
  const location = useLocation();
  const showChatbot = location.pathname.startsWith('/gitlab-tracker');

  return (
    <div className="min-h-screen bg-background font-sans antialiased relative">
      <Routes>
        <Route path="/" element={<FoundryHome />} />

        {/* Resume Scorer Routes */}
        <Route path="/resume-scorer" element={<ResumeScorerHome />} />
        <Route path="/resume-scorer/dashboard/:jdId" element={<Dashboard />} />
        {/* Legacy route support if needed */}
        <Route path="/dashboard/:jdId" element={<Dashboard />} />

        {/* GitLab Tracker Routes */}
        <Route path="/gitlab-tracker" element={<GitLabTracker />} />

        {/* Neil Platform Routes */}
        <Route path="/neil" element={<NeilHome />} />
        <Route path="/neil/competitive-analysis" element={<CompetitiveAnalysis />} />

        {/* InfiniteTalk Routes */}
        <Route path="/avatar-studio" element={<InfiniteTalkHome />} />
      </Routes>

      <Toaster />
      {showChatbot && <Chatbot />}
    </div>
  );
}

function App() {
  return (
    <ApiKeyProvider>
      <Router>
        <AppContent />
      </Router>
    </ApiKeyProvider>
  );
}

export default App;
