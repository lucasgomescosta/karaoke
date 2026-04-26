import { Music2, Wrench } from 'lucide-react';

type HeaderProps = {
  onNavigateSync?: () => void;
};

export function Header({ onNavigateSync }: HeaderProps) {
  return (
    <header className="mb-7 flex items-center gap-4">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-[0_18px_40px_rgba(236,72,153,0.28)]">
        <Music2 size={28} />
      </div>

      <div className="flex-1">
        <h1 className="text-4xl font-black leading-none text-white md:text-5xl">
          Karaoke Score
        </h1>
        <p className="mt-2 text-slate-300">
          Projeto pessoal com YouTube, microfone e pontuação.
        </p>
      </div>

      {onNavigateSync && (
        <button
          onClick={onNavigateSync}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-slate-700/60 hover:text-white"
        >
          <Wrench size={16} />
          <span className="hidden sm:inline">Lyrics Sync</span>
        </button>
      )}
    </header>
  );
}