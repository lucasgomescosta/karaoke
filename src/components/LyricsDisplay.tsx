import { useEffect, useRef } from 'react';
import type { LineStatus, LyricLine } from '../types/song';

type LyricsDisplayProps = {
  lyrics: LyricLine[];
  lineStatuses: Record<number, LineStatus>;
  activeLineIndex: number;
  isSinging: boolean;
  currentTime: number;
};

const STATUS_CONFIG: Record<
  LineStatus,
  { color: string; icon: string; glow: string }
> = {
  upcoming: {
    color: 'text-slate-500',
    icon: '',
    glow: '',
  },
  active: {
    color: 'text-white',
    icon: '🎤',
    glow: 'lyrics-glow-active',
  },
  hit: {
    color: 'text-emerald-400',
    icon: '✓',
    glow: '',
  },
  perfect: {
    color: 'text-yellow-300',
    icon: '★',
    glow: 'lyrics-glow-perfect',
  },
  missed: {
    color: 'text-red-400',
    icon: '✗',
    glow: '',
  },
};

export function LyricsDisplay({
  lyrics,
  lineStatuses,
  activeLineIndex,
  isSinging,
  currentTime,
}: LyricsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para manter a linha ativa centralizada
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  if (lyrics.length === 0) {
    return (
      <section className="lyrics-panel rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-md">
        <h2 className="mb-4 text-center text-lg font-bold text-white">
          ♪ Letra
        </h2>
        <p className="text-center text-slate-400">
          Nenhuma letra disponível para esta música.
        </p>
      </section>
    );
  }

  // Calcular progresso da linha ativa
  const activeLine = activeLineIndex >= 0 ? lyrics[activeLineIndex] : null;
  const lineProgress = activeLine
    ? Math.min(
        100,
        ((currentTime - activeLine.startTime) /
          (activeLine.endTime - activeLine.startTime)) *
          100,
      )
    : 0;

  return (
    <section className="lyrics-panel rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <h2 className="text-lg font-bold text-white">♪ Letra</h2>
        {activeLineIndex >= 0 && (
          <span className="text-sm text-slate-400">
            Linha {activeLineIndex + 1}/{lyrics.length}
          </span>
        )}
      </div>

      {/* Barra de progresso da linha ativa */}
      {activeLine && (
        <div className="h-1 w-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 transition-all duration-100"
            style={{ width: `${lineProgress}%` }}
          />
        </div>
      )}

      {/* Letras com scroll */}
      <div
        ref={containerRef}
        className="lyrics-scroll-container max-h-[420px] overflow-y-auto px-6 py-5"
      >
        <div className="flex flex-col gap-2">
          {lyrics.map((line, index) => {
            const status = lineStatuses[line.id] ?? 'upcoming';
            const config = STATUS_CONFIG[status];
            const isActive = index === activeLineIndex;
            const isActiveSinging = isActive && isSinging;

            return (
              <div
                key={line.id}
                ref={isActive ? activeLineRef : undefined}
                className={`
                  lyrics-line group relative rounded-2xl px-4 py-3 transition-all duration-300
                  ${isActive ? 'lyrics-line-active scale-[1.02] bg-white/5' : ''}
                  ${isActiveSinging ? 'lyrics-line-singing bg-white/10' : ''}
                  ${status === 'hit' ? 'bg-emerald-500/5' : ''}
                  ${status === 'perfect' ? 'bg-yellow-500/5' : ''}
                  ${status === 'missed' ? 'bg-red-500/5 opacity-50' : ''}
                  ${config.glow}
                `}
              >
                {/* Ícone de feedback */}
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 min-w-[20px] text-sm ${config.color}`}
                  >
                    {config.icon}
                  </span>

                  <div className="flex-1">
                    {/* Texto da linha */}
                    <p
                      className={`
                        text-base font-semibold leading-relaxed transition-all duration-300
                        ${config.color}
                        ${isActive ? 'text-xl' : ''}
                        ${status === 'missed' ? 'line-through' : ''}
                      `}
                    >
                      {line.text}
                    </p>

                    {/* Barra de progresso inline para a linha ativa */}
                    {isActive && (
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-100 ${
                            isSinging
                              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${lineProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Indicador de pitch (para a linha ativa) */}
                  {isActive && (
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                        isSinging
                          ? 'scale-110 bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {isSinging ? '♪' : '…'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
