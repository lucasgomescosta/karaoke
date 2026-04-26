import { useCallback, useEffect, useRef, useState } from 'react';
import type { LineStatus, LyricLine } from '../types/song';

/** Tolerância em semitons para considerar o pitch "correto" */
const PITCH_TOLERANCE_SEMITONES = 4;

/** Volume mínimo para considerar que está cantando */
const MIN_SINGING_VOLUME = 15;

/** Pontos por acerto */
const POINTS_HIT = 100;
const POINTS_PERFECT = 200;

type SyncedLyricsState = {
  lineStatuses: Record<number, LineStatus>;
  activeLineIndex: number;
  score: number;
  combo: number;
  maxCombo: number;
  hitCount: number;
  missCount: number;
  perfectCount: number;
  accuracy: number;
  lastFeedback: 'hit' | 'miss' | 'perfect' | null;
};

type UseSyncedLyricsProps = {
  lyrics: LyricLine[];
  currentTime: number;
  volume: number;
  pitch: number;
  isPlaying: boolean;
};

/**
 * Verifica se o pitch detectado está perto o suficiente do pitch de referência.
 * Usa semitons para comparação (independente da oitava exata).
 */
function isPitchClose(detected: number, reference: number, toleranceSemitones: number): boolean {
  if (detected <= 0 || reference <= 0) return false;

  // Calcular a distância em semitons — 12 * log2(f1/f2)
  const semitones = 12 * Math.log2(detected / reference);

  // Normalizar para a oitava mais próxima
  const normalizedSemitones = ((semitones % 12) + 12) % 12;
  const distance = Math.min(normalizedSemitones, 12 - normalizedSemitones);

  return distance <= toleranceSemitones;
}

export function useSyncedLyrics({
  lyrics,
  currentTime,
  volume,
  pitch,
  isPlaying,
}: UseSyncedLyricsProps): SyncedLyricsState {
  const [lineStatuses, setLineStatuses] = useState<Record<number, LineStatus>>({});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<'hit' | 'miss' | 'perfect' | null>(null);

  // Rastrear quais linhas já foram avaliadas (para não pontuar duas vezes)
  const evaluatedLines = useRef<Set<number>>(new Set());

  // Rastrear se a voz foi detectada durante a linha ativa
  const voiceDetectedDuringLine = useRef(false);
  const pitchAccuracyDuringLine = useRef<number[]>([]);
  const currentActiveLineId = useRef<number | null>(null);

  // Encontrar a linha ativa baseado no currentTime
  const activeLineIndex = lyrics.findIndex(
    (line) => currentTime >= line.startTime && currentTime <= line.endTime,
  );

  const activeLine = activeLineIndex >= 0 ? lyrics[activeLineIndex] : null;

  // Monitorar entrada de voz enquanto a linha está ativa
  useEffect(() => {
    if (!activeLine || !isPlaying) return;

    if (currentActiveLineId.current !== activeLine.id) {
      // Nova linha ativa — resetar rastreamento
      currentActiveLineId.current = activeLine.id;
      voiceDetectedDuringLine.current = false;
      pitchAccuracyDuringLine.current = [];
    }

    const isSinging = volume >= MIN_SINGING_VOLUME;

    if (isSinging) {
      voiceDetectedDuringLine.current = true;

      if (activeLine.pitchHz && pitch > 0) {
        const isClose = isPitchClose(pitch, activeLine.pitchHz, PITCH_TOLERANCE_SEMITONES);
        pitchAccuracyDuringLine.current.push(isClose ? 1 : 0);
      }
    }
  }, [activeLine, volume, pitch, isPlaying]);

  // Atualizar statuses das linhas
  useEffect(() => {
    if (!isPlaying) return;

    const newStatuses: Record<number, LineStatus> = {};

    for (const line of lyrics) {
      if (evaluatedLines.current.has(line.id)) {
        // Manter status já avaliado
        newStatuses[line.id] = lineStatuses[line.id] ?? 'upcoming';
      } else if (currentTime >= line.startTime && currentTime <= line.endTime) {
        newStatuses[line.id] = 'active';
      } else if (currentTime > line.endTime) {
        // Linha terminou — avaliar
        evaluateLine(line);
        newStatuses[line.id] = lineStatuses[line.id] ?? 'missed';
      } else {
        newStatuses[line.id] = 'upcoming';
      }
    }

    setLineStatuses(newStatuses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, isPlaying, lyrics]);

  const evaluateLine = useCallback(
    (line: LyricLine) => {
      if (evaluatedLines.current.has(line.id)) return;
      evaluatedLines.current.add(line.id);

      const hadVoice = voiceDetectedDuringLine.current && currentActiveLineId.current === line.id;

      if (!hadVoice) {
        // Perdeu a linha
        setLineStatuses((prev) => ({ ...prev, [line.id]: 'missed' }));
        setCombo(0);
        setMissCount((c) => c + 1);
        setLastFeedback('miss');
        return;
      }

      // Avaliar pitch accuracy
      const pitchSamples = pitchAccuracyDuringLine.current;
      const avgPitchAccuracy =
        pitchSamples.length > 0
          ? pitchSamples.reduce((a, b) => a + b, 0) / pitchSamples.length
          : 0;

      const isPerfect = avgPitchAccuracy >= 0.7; // 70% das amostras no pitch certo

      if (isPerfect) {
        setLineStatuses((prev) => ({ ...prev, [line.id]: 'perfect' }));
        setScore((s) => s + POINTS_PERFECT);
        setCombo((c) => {
          const newCombo = c + 1;
          setMaxCombo((m) => Math.max(m, newCombo));
          return newCombo;
        });
        setPerfectCount((c) => c + 1);
        setHitCount((c) => c + 1);
        setLastFeedback('perfect');
      } else {
        setLineStatuses((prev) => ({ ...prev, [line.id]: 'hit' }));
        setScore((s) => s + POINTS_HIT);
        setCombo((c) => {
          const newCombo = c + 1;
          setMaxCombo((m) => Math.max(m, newCombo));
          return newCombo;
        });
        setHitCount((c) => c + 1);
        setLastFeedback('hit');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Resetar quando muda de música (lyrics muda)
  useEffect(() => {
    setLineStatuses({});
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHitCount(0);
    setMissCount(0);
    setPerfectCount(0);
    setLastFeedback(null);
    evaluatedLines.current.clear();
    voiceDetectedDuringLine.current = false;
    pitchAccuracyDuringLine.current = [];
    currentActiveLineId.current = null;
  }, [lyrics]);

  const totalEvaluated = hitCount + missCount;
  const accuracy = totalEvaluated > 0 ? Math.round((hitCount / totalEvaluated) * 100) : 100;

  return {
    lineStatuses,
    activeLineIndex,
    score,
    combo,
    maxCombo,
    hitCount,
    missCount,
    perfectCount,
    accuracy,
    lastFeedback,
  };
}
