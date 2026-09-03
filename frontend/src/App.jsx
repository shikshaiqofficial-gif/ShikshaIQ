import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { Loader2 } from 'lucide-react';
import NetworkStatus from './NetworkStatus';
import CustomQuiz from './CustomQuiz';
import BattleMode from './BattleMode';
// Static / Immediate Views
import Home from './Home';
import PwaInstallPrompt from './PwaInstallPrompt';
import MistakeVault from './MistakeVault';
import Home from './Home';
import FlashcardDeck from './FlashcardDeck';
import AdminPortal from './AdminPortal';
import DoubtSolver from './DoubtSolver';
import AnalyticsHub from './AnalyticsHub';


// Code-Split Lazy Loaded Views (Loaded only when visited)
const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const Dashboard = lazy(() => import('./Dashboard'));
const MockTest = lazy(() => import('./MockTest'));
const Leaderboard = lazy(() => import('./Leaderboard'));
const DoubtSolver = lazy(() => import('./DoubtSolver'));
const CurrentAffairs = lazy(() => import('./CurrentAffairs'));
const JobAlerts = lazy(() => import('./JobAlerts'));
const AdminPanel = lazy(() => import('./AdminPanel'));
const FormulaFlashcards = lazy(() => import('./FormulaFlashcards'));



// Fallback Loading Component
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <span className="text-xs text-slate-400 font-medium tracking-wide">
        Loading ShikshaIQ...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-slate-100 font-sans">
          {/* Mobile PWA Install Prompt Banner */}
          <PwaInstallPrompt />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />

              {/* Core Feature Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mock-test" element={<MockTest />} />
              <Route path="/doubts" element={<DoubtSolver />} />
              <Route path="/flashcards" element={<FormulaFlashcards />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/current-affairs" element={<CurrentAffairs />} />
              <Route path="/jobs" element={<JobAlerts />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/custom-quiz" element={<CustomQuiz />} />
              <Route path="/battle" element={<BattleMode />} />
              <Route path="/mistakes" element={<MistakeVault />} />
              <Route path="/battle/:code" element={<BattleMode />} />
              <Route path="/" element={<Home />} />
              <Route path="/flashcards" element={<FlashcardDeck />} />
              <Route path="/admin" element={<AdminPortal />} />
              <Route path="/doubts" element={<DoubtSolver />} />
              <Route path="/analytics" element={<AnalyticsHub />} />


              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  );
}