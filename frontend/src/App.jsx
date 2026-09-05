import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ---IMPORTS (Single declaration only)---
// Public
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";

// Protected (Lazy loaded)
const Dashboard = lazy(() => import("./Dashboard"));
const MockTest = lazy(() => import("./MockTest"));
const BattleMode = lazy(() => import("./BattleMode"));
const MistakeVault = lazy(() => import("./MistakeVault"));
const FlashcardDeck = lazy(() => import("./FlashcardDeck"));
const DoubtSolver = lazy(() => import("./DoubtSolver"));
const AnalyticsHub = lazy(() => import("./AnalyticsHub"));
const AdminPanel = lazy(() => import("./AdminPanel"));
const LiveClasses = lazy(() => import("./LiveClasses"));
const CurrentAffairs = lazy(() => import("./CurrentAffairs"));
const JobAlerts = lazy(() => import("./JobAlerts")); // <--- Added JobAlerts import

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#070b19] text-indigo-400 font-bold text-xl">
    Loading ShikshaIQ...
  </div>
);

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mock-test" element={<MockTest />} />
          <Route path="/battle" element={<BattleMode />} />
          <Route path="/battle/:code" element={<BattleMode />} />
          <Route path="/mistakes" element={<MistakeVault />} />
          <Route path="/flashcards" element={<FlashcardDeck />} />
          <Route path="/doubts" element={<DoubtSolver />} />
          <Route path="/analytics" element={<AnalyticsHub />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/jobs" element={<JobAlerts />} /> {/* <-- Route registered here */}

          {/* Admin */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}