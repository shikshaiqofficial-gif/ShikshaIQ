import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- SINGLE IMPORTS ONLY ---
// Ensure you only have one instance of these lines:

// Pages that load immediately
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";

// Pages that are code-split (lazy loaded)
const Dashboard = lazy(() => import("./Dashboard"));
const MockTest = lazy(() => import("./MockTest"));
const BattleMode = lazy(() => import("./BattleMode"));
const MistakeVault = lazy(() => import("./MistakeVault"));
const FlashcardDeck = lazy(() => import("./FlashcardDeck"));
// Error showed duplicate declaration here, keep only the lazy one:
const DoubtSolver = lazy(() => import("./DoubtSolver"));
const AnalyticsHub = lazy(() => import("./AnalyticsHub"));
const AdminPanel = lazy(() => import("./AdminPanel"));

// Simple Loading Component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#070b19] text-indigo-400 font-bold text-xl">
    Loading ShikshaIQ...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mock-test" element={<MockTest />} />
          <Route path="/battle" element={<BattleMode />} />
          <Route path="/battle/:code" element={<BattleMode />} />
          <Route path="/mistakes" element={<MistakeVault />} />
          <Route path="/flashcards" element={<FlashcardDeck />} />
          <Route path="/doubts" element={<DoubtSolver />} />
          <Route path="/analytics" element={<AnalyticsHub />} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}