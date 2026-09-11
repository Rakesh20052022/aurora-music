"use client";

import React, { useState, useEffect } from 'react';
import { searchTracks, getTrendingTracks } from '../lib/audius';
import { MusicCard } from '../components/MusicCard';
import { Search, Loader2 } from 'lucide-react';

export default function Page() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Load trending tracks on initial visit
    getTrendingTracks().then((trending) => {
      setTracks(trending);
      setLoading(false);
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    const results = await searchTracks(query);
    setTracks(results);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Discover Music
          </h1>
          <p className="text-zinc-400 text-lg">Search and stream from Audius</p>
        </header>

        <form onSubmit={handleSearch} className="relative mb-12 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for songs, artists, or keywords..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
            <button 
              type="submit" 
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black px-6 py-2 rounded-full font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
          </div>
        </form>

        <section>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Searching the Audius network...</p>
            </div>
          )}

          {!loading && searched && tracks.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
              <p className="text-xl mb-2">No tracks found</p>
              <p>Try searching for a different keyword or artist.</p>
            </div>
          )}

          {!loading && tracks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {tracks.map((track) => (
                <MusicCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
