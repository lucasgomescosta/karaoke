import { useState } from "react";
import { KaraokePage } from "./pages/KaraokePage";
import { LyricsSyncPage } from "./pages/LyricsSyncPage";

type Page = 'karaoke' | 'sync';

export default function App() {
  const [page, setPage] = useState<Page>('karaoke');

  if (page === 'sync') {
    return <LyricsSyncPage onBack={() => setPage('karaoke')} />;
  }

  return <KaraokePage onNavigateSync={() => setPage('sync')} />;
}