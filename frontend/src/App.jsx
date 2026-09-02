import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Views
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import MockTest from './MockTest';
import Leaderboard from './Leaderboard';
import DoubtSolver from './DoubtSolver';
import CurrentAffairs from './CurrentAffairs';
import JobAlerts from './JobAlerts';
import AdminPanel from './AdminPanel';
import FormulaFlashcards from './FormulaFlashcards';

// Components
import ProtectedRoute from './ProtectedRoute';
import PwaInstallPrompt from './PwaInstallPrompt';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        {/* Mobile PWA Install Prompt */}
        <PwaInstallPrompt />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          {/* Exam Prep Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mock-test" element={<MockTest />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/doubts" element={<DoubtSolver />} />
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/jobs" element={<JobAlerts />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/flashcards" element={<FormulaFlashcards />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}