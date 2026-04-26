import { useCallback, useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { LyricsDisplay } from '../components/LyricsDisplay';
import { MicrophonePanel } from '../components/MicrophonePanel';
import { ScorePanel } from '../components/ScorePanel';
import { SongSelector } from '../components/SongSelector';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { songs } from '../data/songs';
import { useMicrophoneAnalyzer } from '../hooks/useMicrophoneAnalyzer';
import { useSyncedLyrics } from '../hooks/useSyncedLyrics';

const MIN_SINGING_VOLUME = 15;

type KaraokePageProps = {
  onNavigateSync?: () => void;
};

export function KaraokePage({ onNavigateSync }: KaraokePageProps) {
  const [selectedSongId, setSelectedSongId] = useState(songs[0].id);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { volume, pitch, isListening, error, start, stop } =
    useMicrophoneAnalyzer();

  const selectedSong = useMemo(() => {
    return songs.find((song) => song.id === selectedSongId) ?? songs[0];
  }, [selectedSongId]);

  const isSinging = isListening && volume >= MIN_SINGING_VOLUME;

  const {
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
  } = useSyncedLyrics({
    lyrics: selectedSong.lyrics,
    currentTime,
    volume,
    pitch,
    isPlaying: isPlaying && isListening,
  });

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handlePlayingChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  function handleSelectSong(songId: string) {
    setSelectedSongId(songId);
    setCurrentTime(0);
    setIsPlaying(false);
  }

  return (
    <main className="karaoke-bg min-h-screen px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-7xl">
        <Header onNavigateSync={onNavigateSync} />

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Coluna principal: player + letras */}
          <div className="flex flex-col gap-5">
            <SongSelector
              songs={songs}
              selectedSongId={selectedSongId}
              onSelectSong={handleSelectSong}
            />

            <YouTubePlayer
              videoId={selectedSong.youtubeVideoId}
              onTimeUpdate={handleTimeUpdate}
              onPlayingChange={handlePlayingChange}
            />

            <LyricsDisplay
              lyrics={selectedSong.lyrics}
              lineStatuses={lineStatuses}
              activeLineIndex={activeLineIndex}
              isSinging={isSinging}
              currentTime={currentTime}
            />
          </div>

          {/* Sidebar: microfone + pontuação */}
          <aside className="order-first flex flex-col gap-5 lg:order-none">
            <MicrophonePanel
              volume={volume}
              pitch={pitch}
              isListening={isListening}
              error={error}
              onStart={start}
              onStop={stop}
            />

            <ScorePanel
              score={score}
              combo={combo}
              maxCombo={maxCombo}
              hitCount={hitCount}
              missCount={missCount}
              perfectCount={perfectCount}
              accuracy={accuracy}
              isSinging={isSinging}
              lastFeedback={lastFeedback}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}