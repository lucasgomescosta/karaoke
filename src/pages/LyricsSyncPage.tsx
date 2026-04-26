import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ClipboardCopy, Download, Keyboard, RotateCcw } from 'lucide-react';
import { loadYouTubeAPI } from '../lib/youtubeApi';

/* ── Types ────────────────────────────────────────────────────── */
type SyncedLine = {
  id: number;
  text: string;
  startTime: number | null;
  endTime: number | null;
};

type SyncPhase = 'idle' | 'editing' | 'syncing' | 'done';

/* ── Props ────────────────────────────────────────────────────── */
type LyricsSyncPageProps = {
  onBack: () => void;
};

/* ── Component ────────────────────────────────────────────────── */
export function LyricsSyncPage({ onBack }: LyricsSyncPageProps) {
  // State
  const [videoId, setVideoId] = useState('');
  const [rawLyrics, setRawLyrics] = useState('');
  const [lines, setLines] = useState<SyncedLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<SyncPhase>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [waitingForStart, setWaitingForStart] = useState(true);

  // Refs
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // ── Parse lyrics ──────────────────────────────────────────────
  function handleParseLyrics() {
    const parsed = rawLyrics
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((text, i) => ({
        id: i + 1,
        text,
        startTime: null,
        endTime: null,
      }));

    if (parsed.length === 0) return;

    setLines(parsed);
    setCurrentIndex(0);
    setPhase('editing');
    setWaitingForStart(true);
  }

  // ── Init YouTube Player ───────────────────────────────────────
  useEffect(() => {
    if (!videoId || phase === 'idle') return;

    let mounted = true;

    async function init() {
      await loadYouTubeAPI();
      if (!mounted || !containerRef.current) return;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const playerDiv = document.createElement('div');
      playerDiv.id = `sync-player-${Date.now()}`;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerDiv.id, {
        videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          fs: 1,
          enablejsapi: 1,
        },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (!mounted) return;
            const playing = event.data === window.YT.PlayerState.PLAYING;
            setIsPlaying(playing);
          },
        },
      });
    }

    init();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, phase]);

  // ── Time polling ──────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 50); // 20fps para maior precisão
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  // ── Auto-scroll ───────────────────────────────────────────────
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  // ── Keyboard shortcuts ────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== 'syncing' && phase !== 'editing') return;

      // Ignore if typing in input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const time = playerRef.current?.getCurrentTime?.() ?? 0;

      switch (e.code) {
        case 'Space': {
          e.preventDefault();

          if (phase === 'editing') {
            setPhase('syncing');
          }

          // Marcar início da frase atual
          setLines((prev) => {
            const updated = [...prev];
            updated[currentIndex] = {
              ...updated[currentIndex],
              startTime: Math.round(time * 10) / 10,
              endTime: null, // Reset endTime when restarting
            };
            return updated;
          });
          setWaitingForStart(false);
          break;
        }

        case 'Enter': {
          e.preventDefault();
          if (waitingForStart) break; // Precisa marcar início primeiro

          // Marcar fim da frase atual
          setLines((prev) => {
            const updated = [...prev];
            updated[currentIndex] = {
              ...updated[currentIndex],
              endTime: Math.round(time * 10) / 10,
            };
            return updated;
          });

          // Avançar para próxima frase
          if (currentIndex < lines.length - 1) {
            setCurrentIndex((i) => i + 1);
            setWaitingForStart(true);
          } else {
            setPhase('done');
          }
          break;
        }

        case 'KeyR': {
          e.preventDefault();
          // Refazer frase atual
          setLines((prev) => {
            const updated = [...prev];
            updated[currentIndex] = {
              ...updated[currentIndex],
              startTime: null,
              endTime: null,
            };
            return updated;
          });
          setWaitingForStart(true);
          break;
        }

        case 'KeyS': {
          e.preventDefault();
          handleCopyJSON();
          break;
        }

        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, currentIndex, lines.length, waitingForStart],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Generate JSON ─────────────────────────────────────────────
  function generateJSON(): string {
    const output = lines.map((line) => ({
      id: line.id,
      text: line.text,
      startTime: line.startTime ?? 0,
      endTime: line.endTime ?? 0,
      pitchHz: null,
    }));
    return JSON.stringify(output, null, 2);
  }

  function handleCopyJSON() {
    const json = generateJSON();
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadJSON() {
    const json = generateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyrics-sync-${videoId || 'output'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Reset ─────────────────────────────────────────────────────
  function handleReset() {
    setLines([]);
    setCurrentIndex(0);
    setPhase('idle');
    setCurrentTime(0);
    setIsPlaying(false);
    setWaitingForStart(true);
  }

  // ── Helpers ───────────────────────────────────────────────────
  function formatTime(seconds: number | null): string {
    if (seconds === null) return '—';
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m}:${s.padStart(4, '0')}`;
  }

  const syncedCount = lines.filter((l) => l.startTime !== null && l.endTime !== null).length;
  const progress = lines.length > 0 ? Math.round((syncedCount / lines.length) * 100) : 0;

  // ── Render ────────────────────────────────────────────────────
  return (
    <main className="karaoke-bg min-h-screen px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <header className="mb-7 flex items-center gap-4">
          <button
            onClick={onBack}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-800/80 transition hover:bg-slate-700/80"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex-1">
            <h1 className="text-3xl font-black leading-none text-white md:text-4xl">
              Lyrics Sync Agent
            </h1>
            <p className="mt-1.5 text-slate-400">
              Sincronize letras com o vídeo usando atalhos de teclado
            </p>
          </div>

          {phase !== 'idle' && (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-slate-400">Progresso:</span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
          )}
        </header>

        {/* === FASE IDLE: Setup ==================== */}
        {phase === 'idle' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* YouTube ID */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-md">
              <h2 className="mb-4 text-lg font-bold text-white">
                1. Vídeo do YouTube
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Cole o ID do vídeo (ex: ePjtnSPFWK8)"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value.trim())}
                  className="flex-1 rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-pink-400"
                />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                O ID é a parte final do link: youtube.com/watch?v=<strong className="text-slate-300">ePjtnSPFWK8</strong>
              </p>
            </section>

            {/* Lyrics input */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-md">
              <h2 className="mb-4 text-lg font-bold text-white">
                2. Cole a letra (uma frase por linha)
              </h2>
              <textarea
                rows={10}
                placeholder={`Quando eu digo que deixei de te amar\nÉ porque eu te amo\nQuando eu digo que não quero mais você\nÉ porque eu te quero`}
                value={rawLyrics}
                onChange={(e) => setRawLyrics(e.target.value)}
                className="w-full resize-none rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 font-mono text-sm leading-relaxed text-white outline-none transition placeholder:text-slate-600 focus:border-pink-400"
              />
              <p className="mt-2 text-sm text-slate-500">
                {rawLyrics.split('\n').filter((l) => l.trim()).length} linhas detectadas
              </p>
            </section>

            {/* Start button */}
            <div className="lg:col-span-2">
              <button
                onClick={handleParseLyrics}
                disabled={!videoId || !rawLyrics.trim()}
                className="w-full rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
              >
                Iniciar Sincronização
              </button>
            </div>
          </div>
        )}

        {/* === FASE EDITING / SYNCING / DONE ======= */}
        {phase !== 'idle' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Left column: Player + Lines */}
            <div className="flex flex-col gap-5">
              {/* YouTube Player */}
              <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Player</h2>
                  <span className="rounded-lg bg-slate-800 px-3 py-1 font-mono text-sm text-slate-300">
                    {formatTime(currentTime)}
                  </span>
                </div>
                <div
                  ref={containerRef}
                  className="relative overflow-hidden rounded-2xl bg-black pt-[56.25%] [&>*]:absolute [&>*]:inset-0 [&>*]:h-full [&>*]:w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
                />
              </section>

              {/* Lines list */}
              <section className="sync-lines-panel rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">
                    Frases ({syncedCount}/{lines.length})
                  </h2>
                  {phase === 'syncing' && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-400">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                      Sincronizando
                    </span>
                  )}
                  {phase === 'done' && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                      Concluído!
                    </span>
                  )}
                </div>

                <div className="lyrics-scroll-container max-h-[400px] overflow-y-auto px-4 py-3">
                  {lines.map((line, index) => {
                    const isCurrent = index === currentIndex && phase !== 'done';
                    const isSynced = line.startTime !== null && line.endTime !== null;
                    const isPast = index < currentIndex || (phase === 'done' && isSynced);

                    return (
                      <div
                        key={line.id}
                        ref={isCurrent ? activeLineRef : undefined}
                        className={`
                          group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300
                          ${isCurrent ? 'scale-[1.01] bg-white/8 ring-1 ring-violet-500/30' : ''}
                          ${isPast && isSynced ? 'bg-emerald-500/5' : ''}
                          ${!isCurrent && !isPast ? 'opacity-40' : ''}
                        `}
                      >
                        {/* Line number */}
                        <span className={`min-w-[28px] text-right font-mono text-sm ${isCurrent ? 'text-violet-400' : 'text-slate-600'}`}>
                          {line.id}
                        </span>

                        {/* Status icon */}
                        <span className="min-w-[20px] text-center">
                          {isSynced ? (
                            <span className="text-emerald-400">✓</span>
                          ) : isCurrent ? (
                            <span className="text-amber-400">▶</span>
                          ) : (
                            <span className="text-slate-700">○</span>
                          )}
                        </span>

                        {/* Text */}
                        <span className={`flex-1 text-sm font-medium ${isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                          {line.text}
                        </span>

                        {/* Timestamps */}
                        <div className="flex gap-2 font-mono text-xs">
                          <span className={line.startTime !== null ? 'text-cyan-400' : 'text-slate-700'}>
                            {formatTime(line.startTime)}
                          </span>
                          <span className="text-slate-700">→</span>
                          <span className={line.endTime !== null ? 'text-pink-400' : 'text-slate-700'}>
                            {formatTime(line.endTime)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right column: Controls + JSON */}
            <aside className="flex flex-col gap-5">
              {/* Current line highlight */}
              {phase === 'syncing' && currentIndex < lines.length && (
                <section className="rounded-3xl border border-violet-500/20 bg-violet-950/40 p-5 shadow-2xl backdrop-blur-md">
                  <p className="mb-1 text-sm text-violet-300">Frase atual:</p>
                  <p className="text-xl font-bold leading-relaxed text-white">
                    {lines[currentIndex].text}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    <span className={`rounded-lg px-2 py-1 font-mono ${
                      waitingForStart ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {waitingForStart ? '⏳ Aperte ESPAÇO para início' : '🎤 Aperte ENTER para fim'}
                    </span>
                  </div>
                </section>
              )}

              {/* Keyboard shortcuts */}
              <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-md">
                <div className="mb-4 flex items-center gap-2">
                  <Keyboard size={18} className="text-slate-400" />
                  <h2 className="text-lg font-bold text-white">Atalhos</h2>
                </div>

                <div className="flex flex-col gap-2.5">
                  {[
                    { key: 'ESPAÇO', desc: 'Marcar início da frase', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
                    { key: 'ENTER', desc: 'Marcar fim → próxima frase', color: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
                    { key: 'R', desc: 'Refazer frase atual', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
                    { key: 'S', desc: 'Copiar JSON', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                  ].map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center gap-3">
                      <kbd className={`inline-flex min-w-[72px] items-center justify-center rounded-lg border px-2.5 py-1.5 font-mono text-xs font-bold ${shortcut.color}`}>
                        {shortcut.key}
                      </kbd>
                      <span className="text-sm text-slate-300">{shortcut.desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions */}
              <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-md">
                <h2 className="mb-4 text-lg font-bold text-white">Ações</h2>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleCopyJSON}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5"
                  >
                    <ClipboardCopy size={18} />
                    {copied ? 'Copiado! ✓' : 'Copiar JSON'}
                  </button>

                  <button
                    onClick={handleDownloadJSON}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-400/15 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-400/25"
                  >
                    <Download size={18} />
                    Baixar JSON
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-500/15 px-4 py-3 font-bold text-red-300 transition hover:-translate-y-0.5 hover:bg-red-500/25"
                  >
                    <RotateCcw size={18} />
                    Recomeçar
                  </button>
                </div>
              </section>

              {/* JSON Preview */}
              {syncedCount > 0 && (
                <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-md">
                  <h2 className="mb-3 text-lg font-bold text-white">
                    JSON Preview
                  </h2>
                  <pre className="lyrics-scroll-container max-h-[300px] overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
                    {generateJSON()}
                  </pre>
                </section>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
