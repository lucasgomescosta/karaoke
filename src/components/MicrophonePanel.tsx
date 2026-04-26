import { Mic, MicOff } from 'lucide-react';

type MicrophonePanelProps = {
  volume: number;
  pitch: number;
  isListening: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
};

function pitchToNote(hz: number): string {
  if (hz <= 0) return '—';

  const noteNames = [
    'C', 'C#', 'D', 'D#', 'E', 'F',
    'F#', 'G', 'G#', 'A', 'A#', 'B',
  ];
  const A4 = 440;
  const semitones = 12 * Math.log2(hz / A4);
  const noteIndex = Math.round(semitones) % 12;
  const octave = Math.floor(Math.log2(hz / (A4 / 16)));
  const normalizedIndex = ((noteIndex % 12) + 12) % 12;
  return `${noteNames[normalizedIndex]}${octave}`;
}

export function MicrophonePanel({
  volume,
  pitch,
  isListening,
  error,
  onStart,
  onStop,
}: MicrophonePanelProps) {
  const volumePercentage = Math.min(volume, 100);
  const noteName = pitchToNote(pitch);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-md">
      <h2 className="mb-4 text-lg font-bold text-white">Microfone</h2>

      <div className="mb-4 flex items-center gap-3 text-slate-200">
        {isListening ? <Mic size={28} /> : <MicOff size={28} />}
        <span>{isListening ? 'Capturando voz' : 'Microfone parado'}</span>
      </div>

      {/* Barra de volume */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-400/25">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
          style={{ width: `${volumePercentage}%` }}
        />
      </div>

      {/* Volume + Pitch info */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-slate-300">
          Volume: <strong>{volume}</strong>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Nota:</span>
          <span
            className={`rounded-lg px-2 py-0.5 text-sm font-bold transition-all ${
              pitch > 0
                ? 'bg-violet-500/20 text-violet-300'
                : 'bg-slate-700/50 text-slate-500'
            }`}
          >
            {noteName}
          </span>
          {pitch > 0 && (
            <span className="text-xs text-slate-500">{pitch}Hz</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          className="rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          onClick={onStart}
          disabled={isListening}
        >
          Iniciar
        </button>

        <button
          className="rounded-2xl bg-slate-400/20 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          onClick={onStop}
          disabled={!isListening}
        >
          Parar
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-red-100">
          {error}
        </p>
      )}
    </section>
  );
}