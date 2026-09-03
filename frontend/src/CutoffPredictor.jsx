import React, { useState, useEffect } from 'react';
import API from './api';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CutoffPredictor({ defaultScore = 120, exam = 'SSC CGL' }) {
  const [category, setCategory] = useState('UR');
  const [rawScore, setRawScore] = useState(defaultScore);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [category, rawScore]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const res = await API.post('/analytics/cutoff-predictor', {
        rawScore,
        exam,
        category
      });
      if (res.data?.success) {
        setPrediction(res.data);
      }
    } catch (err) {
      console.error('Failed to calculate projection:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">Tier-1 Category Cut-Off Predictor</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{exam} 2026</span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
          >
            <option value="UR">UR (General)</option>
            <option value="OBC">OBC</option>
            <option value="EWS">EWS</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-semibold">Raw Mock Score</label>
          <input
            type="number"
            min="0"
            max="200"
            value={rawScore}
            onChange={(e) => setRawScore(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Projection Display */}
      {prediction && (
        <div className="space-y-3 pt-1">
          {/* Status Badge */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              prediction.probabilityPercent >= 75
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : prediction.probabilityPercent >= 50
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {prediction.probabilityPercent >= 75 ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : prediction.probabilityPercent >= 50 ? (
                <TrendingUp className="w-4 h-4 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0" />
              )}
              <div>
                <span className="font-bold block">{prediction.qualificationStatus}</span>
                <span className="text-[10px] opacity-80">
                  {prediction.deltaNeeded > 0
                    ? `Needs +${prediction.deltaNeeded} marks to secure Safe Zone`
                    : 'Cleared safe clearing benchmark'}
                </span>
              </div>
            </div>

            <span className="font-mono font-black text-sm">{prediction.probabilityPercent}% Chance</span>
          </div>

          {/* Detailed Projections Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Estimated Norm.</span>
              <span className="font-mono font-bold text-indigo-400 text-sm mt-0.5 block">
                {prediction.estimatedNormalizedScore}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Safe Cut-Off</span>
              <span className="font-mono font-bold text-slate-200 text-sm mt-0.5 block">
                {prediction.benchmarkSafe}
              </span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Target Gap</span>
              <span
                className={`font-mono font-bold text-sm mt-0.5 block ${
                  prediction.deltaNeeded === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {prediction.deltaNeeded === 0 ? 'CLEARED' : `+${prediction.deltaNeeded}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}