import { useCallback, useEffect, useRef, useState } from 'react';

type MicrophoneAnalyzerState = {
  volume: number;
  pitch: number;         // Frequência fundamental detectada em Hz (0 se não detectado)
  isListening: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
};

/**
 * Detecta a frequência fundamental (pitch) usando autocorrelação.
 * Algoritmo baseado em McLeod Pitch Method simplificado.
 */
function detectPitch(
  analyser: AnalyserNode,
  buffer: Float32Array,
  sampleRate: number,
): number {
  analyser.getFloatTimeDomainData(buffer);

  // Verificar se há sinal (RMS check)
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);

  // Se o volume for muito baixo, não há nota
  if (rms < 0.01) return 0;

  // Autocorrelação
  const SIZE = buffer.length;
  const correlations = new Float32Array(SIZE);

  for (let lag = 0; lag < SIZE; lag++) {
    let sum = 0;
    for (let i = 0; i < SIZE - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    correlations[lag] = sum;
  }

  // Encontrar o primeiro vale depois do pico em lag=0
  let foundValley = false;
  let bestLag = -1;
  let bestCorrelation = 0;

  // Pular o pico em lag=0 — procurar primeiro vale
  for (let lag = 1; lag < SIZE; lag++) {
    if (!foundValley && correlations[lag] < 0) {
      foundValley = true;
    }
    if (foundValley) {
      if (correlations[lag] > bestCorrelation) {
        bestCorrelation = correlations[lag];
        bestLag = lag;
      }
      // Se já encontramos um pico e começou a cair, paramos
      if (correlations[lag] < bestCorrelation * 0.9 && bestLag > 0) {
        break;
      }
    }
  }

  if (bestLag === -1 || bestCorrelation < correlations[0] * 0.3) {
    return 0; // Não foi possível detectar pitch confiável
  }

  // Interpolação parabólica para precisão subamostral
  const prev = correlations[bestLag - 1] ?? 0;
  const curr = correlations[bestLag];
  const next = correlations[bestLag + 1] ?? 0;

  const shift = (prev - next) / (2 * (prev - 2 * curr + next));
  const refinedLag = bestLag + (isFinite(shift) ? shift : 0);

  const frequency = sampleRate / refinedLag;

  // Filtrar frequências fora do range vocal humano (80Hz - 1100Hz)
  if (frequency < 80 || frequency > 1100) return 0;

  return Math.round(frequency * 10) / 10;
}

export function useMicrophoneAnalyzer(): MicrophoneAnalyzerState {
  const [volume, setVolume] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;

    setIsListening(false);
    setVolume(0);
    setPitch(0);
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      // FFT maior para melhor resolução de pitch
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const timeDomainBuffer = new Float32Array(analyser.fftSize);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsListening(true);

      const analyze = () => {
        // Volume (usando frequencyData)
        analyser.getByteFrequencyData(frequencyData);
        const average =
          frequencyData.reduce((sum, value) => sum + value, 0) /
          frequencyData.length;
        setVolume(Math.round(average));

        // Pitch (usando timeDomainData + autocorrelação)
        const detectedPitch = detectPitch(
          analyser,
          timeDomainBuffer,
          audioContext.sampleRate,
        );
        setPitch(detectedPitch);

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err) {
      console.error(err);
      setError(
        'Não foi possível acessar o microfone. Verifique a permissão do navegador.',
      );
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    volume,
    pitch,
    isListening,
    error,
    start,
    stop,
  };
}