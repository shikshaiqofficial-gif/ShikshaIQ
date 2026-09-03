import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from './api';
import {
  Swords,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Clock,
  Trophy,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Users
} from 'lucide-react';

export default function BattleMode() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active Battle Execution State
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (code) {
      fetchChallenge(code);
    }
  }, [code]);

  useEffect(() => {
    if (!isStarted || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isStarted, isSubmitted]);

  const fetchChallenge = async (challengeCode) => {
    try {
      setLoading(true);
      const res = await API.get(`/challenges/${challengeCode}`);
      if (res.data?.challenge) {
        setChallenge(res.data.challenge);
      }
    } catch (err) {
      alert('Battle not found or expired.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBattle = async () => {
    try {
      setLoading(true);
      const res = await API.post('/challenges/create', { subject: 'All' });
      if (res.data?.challenge) {
        setChallenge(res.data.challenge);
        navigate(`/battle/${res.data.challenge.challengeCode}`);
      }
    } catch (err) {
      alert('Failed to initiate battle.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (isSubmitted || !challenge) return;
    try {
      const res = await API.post(`/challenges/${challenge.challengeCode}/submit`, {
        answers,
        timeTakenSeconds: 300 - timeLeft
      });
      if (res.data?.challenge) {
        setChallenge(res.data.challenge);
        setIsSubmitted(true);
      }
    } catch (err) {
      alert('Battle submission failed.');
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Initial State: No Battle Selected
  if (!code && !challenge) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <Swords className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">1v1 Rapid Peer Battle</h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Challenge a friend or peer to solve 10 identical high-yield questions in 5 minutes.
            </p>
          </div>
          <button
            onClick={handleCreateBattle}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
          >
            <Zap className="w-4 h-4" /> Create Challenge Link
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = challenge?.questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500" />
            <h1 className="font-bold text-sm">1v1 Peer Battle Arena</h1>
          </div>
        </div>

        {isStarted && !isSubmitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className={timeLeft < 60 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Lobby Screen */}
        {!isStarted && !isSubmitted ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-full">
              Code: {challenge?.challengeCode}
            </div>

            <h2 className="text-xl font-black text-white">Share Link with Opponent</h2>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-transparent px-2 text-slate-400 outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Competitor Status */}
            <div className="grid grid-cols-2 gap-3 text-left text-xs">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Challenger 1</span>
                <span className="font-bold text-slate-200 block text-sm mt-0.5">{challenge?.creator?.name}</span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {challenge?.creator?.submittedAt ? `Scored ${challenge.creator.score} pts` : 'Ready to start'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Challenger 2</span>
                <span className="font-bold text-slate-200 block text-sm mt-0.5">
                  {challenge?.opponent?.name || 'Awaiting Opponent...'}
                </span>
                <span className="text-[11px] text-indigo-400 font-mono">
                  {challenge?.opponent?.submittedAt ? `Scored ${challenge.opponent.score} pts` : 'Link required'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30"
            >
              <Swords className="w-4 h-4" /> Start Battle Now
            </button>
          </div>
        ) : !isSubmitted ? (
          /* Live Test Phase */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
              <span className="font-bold text-rose-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {challenge?.questions?.length}
              </span>
              <span className="text-slate-500 font-mono">+2.0 / -0.5</span>
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-100">{currentQ?.questionText}</p>

            <div className="space-y-2.5">
              {currentQ?.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [currentQ._id]: i })}
                  className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left flex items-center justify-between transition cursor-pointer ${
                    answers[currentQ._id] === i
                      ? 'border-rose-500 bg-rose-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <span>{String.fromCharCode(65 + i)}. {opt}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl cursor-pointer"
              >
                Previous
              </button>

              {currentIndex === challenge?.questions?.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Submit Battle
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((p) => Math.min(challenge?.questions?.length - 1, p + 1))}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Battle Results Resolution */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Battle Finished</h2>
              <p className="text-xs text-slate-400 mt-1">
                {challenge?.status === 'completed'
                  ? `Winner: ${challenge.winner === 'creator' ? challenge.creator.name : challenge.winner === 'opponent' ? challenge.opponent.name : 'Draw Match'}`
                  : 'Awaiting opponent submission to calculate final winner.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold block uppercase">{challenge?.creator?.name}</span>
                <span className="text-xl font-black text-white font-mono">{challenge?.creator?.score ?? '--'} pts</span>
                <span className="text-[11px] text-slate-400 block">{challenge?.creator?.accuracy ?? '--'}% Acc</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold block uppercase">{challenge?.opponent?.name || 'Opponent'}</span>
                <span className="text-xl font-black text-white font-mono">{challenge?.opponent?.score ?? '--'} pts</span>
                <span className="text-[11px] text-slate-400 block">{challenge?.opponent?.accuracy ?? '--'}% Acc</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}