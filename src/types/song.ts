/** Uma linha de letra sincronizada com o tempo do vídeo */
export type LyricLine = {
  id: number;
  text: string;
  startTime: number;   // início em segundos
  endTime: number;     // fim em segundos
  /** Nota de referência em Hz (frequência fundamental esperada).
   *  Usado para pitch scoring. Se null, apenas volume é avaliado. */
  pitchHz: number | null;
};

/** Status de cada linha durante a reprodução */
export type LineStatus = 'upcoming' | 'active' | 'hit' | 'missed' | 'perfect';

/** Música com letras sincronizadas */
export type Song = {
  id: string;
  title: string;
  artist: string;
  youtubeVideoId: string;
  lyrics: LyricLine[];
};