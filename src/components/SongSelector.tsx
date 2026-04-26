import type { Song } from '../types/song';

type SongSelectorProps = {
  songs: Song[];
  selectedSongId: string;
  onSelectSong: (songId: string) => void;
};

export function SongSelector({ songs, selectedSongId, onSelectSong }: SongSelectorProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-md">
      <h2 className="mb-4 text-lg font-bold text-white">Escolha a música</h2>

      <select
        className="w-full rounded-2xl border border-white/15 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-pink-400"
        value={selectedSongId}
        onChange={(event) => onSelectSong(event.target.value)}
      >
        {songs.map((song) => (
          <option key={song.id} value={song.id}>
            {song.title} - {song.artist}
          </option>
        ))}
      </select>
    </section>
  );
}