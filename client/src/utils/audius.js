import { sdk } from '@audius/sdk';

const audiusSdk = sdk({
  appName: 'my-project',
});

export const searchTracks = async (query) => {
  try {
    const result = await audiusSdk.tracks.searchTracks({
      query,
    });
    return result.data || [];
  } catch (error) {
    console.error('Error searching Audius tracks:', error);
    return [];
  }
};

export const getTrendingTracks = async () => {
  try {
    const result = await audiusSdk.tracks.getTrendingTracks({
      timeRange: 'week',
    });
    return result.data || [];
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return [];
  }
};

export const getSmartRecommendations = async (currentTrack, history = []) => {
  try {
    const artist = currentTrack?.artist?.name || '';
    let query = artist;
    
    // Add genre if available
    if (currentTrack?.genre) {
      query += ` ${currentTrack.genre}`;
    }

    // Language/Style Heuristics
    const artistLower = artist.toLowerCase();
    if (artistLower.includes('arijit singh') || artistLower.includes('shreya ghoshal') || artistLower.includes('jubin nautiyal')) {
      query = `Bollywood Hindi ${artist}`;
    } else if (artistLower.includes('atif aslam')) {
      query = `Bollywood ${artist}`;
    }

    if (!query.trim()) {
      return await getTrendingTracks();
    }

    const result = await audiusSdk.tracks.searchTracks({
      query: query.trim(),
    });

    let tracks = result.data || [];

    // Filter out recently played tracks to prevent exact repeats
    tracks = tracks.filter(t => !history.includes(t.id) && !history.includes(String(t.id)));

    // Shuffle the results to mix highly similar songs with a small amount of discovery
    tracks = tracks.sort(() => 0.5 - Math.random());

    // If no tracks match, gracefully fallback to trending
    if (tracks.length === 0) {
      const trending = await getTrendingTracks();
      return trending.filter(t => !history.includes(t.id) && !history.includes(String(t.id))).slice(0, 10);
    }

    return tracks.slice(0, 10);
  } catch (error) {
    console.error('Error fetching smart recommendations:', error);
    return [];
  }
};

export const getStreamUrl = async (trackId) => {
  // The SDK's streamTrack method is currently broken and attempts to parse the MP3 as JSON.
  // We use the official API redirect endpoint which seamlessly routes to a healthy storage node.
  return `https://api.audius.co/v1/tracks/${trackId}/stream?app_name=my-project`;
};

export const mapAudiusToTrack = (audiusTrack) => {
  return {
    _id: audiusTrack.id,
    title: audiusTrack.title,
    artist: { name: audiusTrack.user.name, _id: audiusTrack.user.id },
    coverImage: audiusTrack.artwork?.['480x480'] || audiusTrack.artwork?.['150x150'] || '/placeholder-music.jpg',
    duration: audiusTrack.duration,
    isAudius: true, // Custom flag to identify Audius tracks
  };
};

export default audiusSdk;
