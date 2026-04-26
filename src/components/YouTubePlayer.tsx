import { useEffect, useRef, useCallback, useState } from 'react';
import { loadYouTubeAPI } from '../lib/youtubeApi';

type YouTubePlayerProps = {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
};

export function YouTubePlayer({
  videoId,
  onTimeUpdate,
  onPlayingChange,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Polling para currentTime enquanto o vídeo está tocando
  const startTimePolling = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        onTimeUpdate?.(time);
      }
    }, 100);
  }, [onTimeUpdate]);

  const stopTimePolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await loadYouTubeAPI();
      if (!mounted || !containerRef.current) return;

      // Limpar player anterior
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      // Criar container para o iframe
      const el = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(el);

      playerRef.current = new window.YT.Player(el, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          fs: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            if (mounted) setIsReady(true);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (!mounted) return;

            const playing = event.data === window.YT.PlayerState.PLAYING;
            onPlayingChange?.(playing);

            if (playing) {
              startTimePolling();
            } else {
              stopTimePolling();
            }
          },
        },
      });
    }

    init();

    return () => {
      mounted = false;
      stopTimePolling();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Player</h2>
        {isReady && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Sincronizado
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="yt-player-wrap relative overflow-hidden rounded-2xl bg-black"
      />
    </section>
  );
}