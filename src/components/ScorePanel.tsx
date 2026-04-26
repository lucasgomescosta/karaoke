import { useEffect, useState } from 'react';
import { Award, Target, TrendingUp, Zap } from 'lucide-react';

type ScorePanelProps = {
  score: number;
  combo: number;
  maxCombo: number;
  hitCount: number;
  missCount: number;
  perfectCount: number;
  accuracy: number;
  isSinging: boolean;
  lastFeedback: 'hit' | 'miss' | 'perfect' | null;
};

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'from-emerald-400 to-cyan-400';
  if (accuracy >= 50) return 'from-amber-400 to-orange-400';
  return 'from-red-400 to-rose-500';
}

function getAccuracyBorder(accuracy: number): string {
  if (accuracy >= 80) return 'border-emerald-500/30';
  if (accuracy >= 50) return 'border-amber-500/30';
  return 'border-red-500/30';
}

function getAccuracyLabel(accuracy: number): string {
  if (accuracy >= 95) return 'Perfeito!';
  if (accuracy >= 80) return 'Ótimo!';
  if (accuracy >= 60) return 'Bom';
  if (accuracy >= 40) return 'Regular';
  return 'Pratique mais';
}

export function ScorePanel({
  score,
  combo,
  maxCombo,
  hitCount,
  missCount,
  perfectCount,
  accuracy,
  isSinging,
  lastFeedback,
}: ScorePanelProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Animação de feedback
  useEffect(() => {
    if (!lastFeedback) return;

    const texts: Record<string, string> = {
      perfect: '★ PERFEITO!',
      hit: '✓ Acertou!',
      miss: '✗ Perdeu!',
    };

    setFeedbackText(texts[lastFeedback] ?? '');
    setShowFeedback(true);

    const timer = setTimeout(() => setShowFeedback(false), 1200);
    return () => clearTimeout(timer);
  }, [lastFeedback, hitCount, missCount]);

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border bg-slate-900/70 p-5 text-center shadow-2xl backdrop-blur-md transition-colors duration-500 ${getAccuracyBorder(accuracy)}`}
    >
      {/* Feedback popup */}
      {showFeedback && (
        <div
          className={`score-feedback absolute inset-x-0 top-2 z-10 text-center text-2xl font-black ${
            lastFeedback === 'perfect'
              ? 'text-yellow-300'
              : lastFeedback === 'hit'
                ? 'text-emerald-400'
                : 'text-red-400'
          }`}
        >
          {feedbackText}
        </div>
      )}

      <h2 className="mb-4 text-lg font-bold text-white">Pontuação</h2>

      {/* Score principal */}
      <div className="my-4 bg-gradient-to-br from-yellow-300 via-rose-400 to-purple-400 bg-clip-text text-6xl font-black leading-none text-transparent">
        {score.toLocaleString('pt-BR')}
      </div>

      {/* Accuracy badge */}
      <div className="mx-auto mb-4 w-fit">
        <div
          className={`rounded-full bg-gradient-to-r px-4 py-1.5 text-sm font-bold text-white ${getAccuracyColor(accuracy)}`}
        >
          {accuracy}% — {getAccuracyLabel(accuracy)}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/5 p-3">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <Zap size={14} />
            <span>Combo</span>
          </div>
          <strong className="text-lg text-white">{combo}x</strong>
        </div>

        <div className="rounded-2xl bg-white/5 p-3">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <TrendingUp size={14} />
            <span>Max Combo</span>
          </div>
          <strong className="text-lg text-white">{maxCombo}x</strong>
        </div>

        <div className="rounded-2xl bg-white/5 p-3">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <Target size={14} />
            <span>Acertos</span>
          </div>
          <strong className="text-lg text-emerald-400">{hitCount}</strong>
          <span className="text-sm text-slate-500"> / {hitCount + missCount}</span>
        </div>

        <div className="rounded-2xl bg-white/5 p-3">
          <div className="mb-1 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <Award size={14} />
            <span>Perfeitos</span>
          </div>
          <strong className="text-lg text-yellow-300">{perfectCount}</strong>
        </div>
      </div>

      {/* Status de canto */}
      <div
        className={`mt-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
          isSinging
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-slate-800/50 text-slate-500'
        }`}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isSinging ? 'animate-pulse bg-emerald-400' : 'bg-slate-600'
          }`}
        />
        {isSinging ? 'Cantando...' : 'Aguardando voz'}
      </div>
    </section>
  );
}