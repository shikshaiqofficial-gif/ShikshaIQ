import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from './api';
import {
  Swords,
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Trophy,
  Zap,
  Users
} from 'lucide-react';

const SOCKET_SERVER_URL = 'https://shikshaiq-api.onrender.com';

export default function BattleMode() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real-Time Live Competitor State
  const socketRef = useRef(null);
  const [competitors, setCompetitors] = useState([]);
  const [battleOver, setBattleOver] = useState(false);

  // Active Quiz State
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Fetch challenge details
  useEffect(() => {
    if (code) {
      fetchChallenge(code);
    }
  }, [code]);

  // 2. Initialize WebSocket Room
  useEffect(() => {
    if (!code) return;

    socketRef.current = io(SOCKET_SERVER_URL, { transports: ['websocket'] });

    const storedUser = localStorage.getItem('user');
    const userName = storedUser ? JSON.parse(storedUser).name : 'Aspirant';

    socketRef.current.emit('join_battle', { roomId: code, playerName: userName });

    socketRef.current.on('room_update', ({ players }) => {
      setCompetitors(players);
    });

    socketRef.current.on('progress_update', ({ players }) => {
      setCompetitors(players);
    });

    socketRef.current.on('player_finished_broadcast', ({ players, battleOver: isOver }) => {
      setCompetitors(players);
      if (isOver) setBattleOver(true);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [code]);

  // 3. Countdown timer
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

  const handleSelectOption = (idx) => {
    const qId = challenge.questions[currentIndex]._id;
    const nextAnswers = { ...answers, [qId]: idx };
    setAnswers(nextAnswers);

    // Broadcast live question progress over WebSocket
    if (socketRef.current && code) {
      let currentScore = 0;
      challenge.questions.forEach((q) => {
        if (nextAnswers[q._id] === q.correctOptionIndex) currentScore += 2;
      });

      socketRef.current.emit('update_progress', {
        roomId: code,
        currentQ: currentIndex + 1,
        score: currentScore
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted || !challenge) return;
    setIsSubmitted(true);

    let finalScore = 0;
    challenge.questions.forEach((q) => {
      if (answers[q._id] === q.correctOptionIndex) finalScore += 2;
      else if (answers[q._id] !== undefined) finalScore -= 0.5;
    });

    if (socketRef.current && code) {
      socketRef.current.emit('player_finished', {
        roomId: code,
        finalScore: Math.max(0, finalScore),
        timeTakenSeconds: 300 - timeLeft
      });
    }

    try {
      await API.post(`/challenges/${challenge.challengeCode}/submit`, {
        answers,
        timeTakenSeconds: 300 - timeLeft
      });
    } catch (err) {
      console.error('Submission recording error:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Create lobby screen
  if (!code && !challenge) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <Swords className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Live 1v1 Peer Battle Arena</h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Real-time duel. Watch your opponent's progress bar move live as you solve 10 questions.
            </p>
          </div>
          <button
            onClick={handleCreateBattle}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
          >
            <Zap className="w-4 h-4" /> Create Live Arena Room
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
      {/* Header */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500" />
            <h1 className="font-bold text-sm">Live 1v1 Battle Arena</h1>
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

      {/* Main Arena */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center space-y-6">
        {/* Real-Time Live Competitors Progress Bar (Active During Duel) */}
        {isStarted && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-1.5 text-slate-200">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Live Opponent Tracker
              </span>
              <span className="font-mono text-[11px] text-emerald-400 animate-pulse">● Live Synced</span>
            </div>

            <div className="space-y-2">
              {competitors.map((player) => (
                <div key={player.id} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-300">{player.name}</span>
                    <span className="font-mono text-indigo-400">
                      {player.finished ? 'Finished' : `Q${player.currentQ || 0} / 10`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${((player.currentQ || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lobby Screen */}
        {!isStarted && !isSubmitted ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-full">
              Arena Code: {challenge?.challengeCode}
            </div>

            <h2 className="text-xl font-black text-white">Invite Competitor via Link</h2>

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

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Connected Gladiators ({competitors.length})</span>
              <div className="flex flex-wrap gap-2">
                {competitors.map((p) => (
                  <span key={p.id} className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg font-medium">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30"
            >
              <Swords className="w-4 h-4" /> Enter Live Duel
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
                  onClick={() => handleSelectOption(i)}
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
          /* Live Battle Results Resolution */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Battle Finished</h2>
              <p className="text-xs text-slate-400 mt-1">
                {battleOver
                  ? 'All gladiators have completed the duel!'
                  : 'Waiting for opponent to finish... Live results will update instantly.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {competitors.map((player) => (
                <div key={player.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">{player.name}</span>
                  <span className="text-xl font-black text-white font-mono">{player.score ?? 0} pts</span>
                  <span className="text-[11px] text-slate-400 block">
                    {player.finished ? `Completed in ${player.timeTakenSeconds}s` : 'Solving...'}
                  </span>
                </div>
              ))}
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