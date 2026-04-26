/**
 * Singleton loader for the YouTube IFrame Player API.
 *
 * Both YouTubePlayer.tsx and LyricsSyncPage.tsx use this
 * so the API script is loaded exactly once and the ready
 * callback is handled correctly.
 */

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

let loadingState: 'idle' | 'loading' | 'ready' = 'idle';
const pendingCallbacks: (() => void)[] = [];

export function loadYouTubeAPI(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (loadingState === 'ready') {
      resolve();
      return;
    }

    pendingCallbacks.push(resolve);

    if (loadingState === 'loading') return;
    loadingState = 'loading';

    // The API may already be on the page (e.g. HMR reload)
    if (window.YT?.Player) {
      loadingState = 'ready';
      flushCallbacks();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    window.onYouTubeIframeAPIReady = () => {
      loadingState = 'ready';
      flushCallbacks();
    };

    document.head.appendChild(script);
  });
}

function flushCallbacks() {
  const cbs = [...pendingCallbacks];
  pendingCallbacks.length = 0;
  cbs.forEach((cb) => cb());
}
