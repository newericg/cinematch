// ─── User Profile ────────────────────────────────────────────────────────────
export interface UserProfile {
  favoriteGenreIds: number[];
  contentType: 'movie' | 'tv' | 'anime' | 'all';
  decades: string[];             // '1970','1980','1990','2000','2010','2020'
  streamingPlatformIds: number[];
  minRating: number;             // 0, 6, 7, 7.5, 8
}

// ─── Watchlist ───────────────────────────────────────────────────────────────
export interface WatchlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  media_type: 'movie' | 'tv';
  addedAt: string;
}

// ─── Gemini ──────────────────────────────────────────────────────────────────
export interface GeminiSuggestion {
  label: string;
  genreIds: number[];
  tvGenreIds: number[];
  mood: string;
}

export interface GeminiResponse {
  greeting: string;
  suggestions: GeminiSuggestion[];
}

// ─── Static data ─────────────────────────────────────────────────────────────
export const STREAMING_PLATFORMS = [
  { id: 8,   name: 'Netflix',      emoji: '🔴' },
  { id: 119, name: 'Amazon Prime', emoji: '📦' },
  { id: 337, name: 'Disney+',      emoji: '🏰' },
  { id: 384, name: 'Max',          emoji: '🎬' },
  { id: 307, name: 'Globoplay',    emoji: '🟢' },
  { id: 531, name: 'Paramount+',   emoji: '⭐' },
];

export const DECADES = [
  { id: '1970', label: '70s', from: '1960-01-01', to: '1979-12-31' },
  { id: '1980', label: '80s', from: '1980-01-01', to: '1989-12-31' },
  { id: '1990', label: '90s', from: '1990-01-01', to: '1999-12-31' },
  { id: '2000', label: '2000s', from: '2000-01-01', to: '2009-12-31' },
  { id: '2010', label: '2010s', from: '2010-01-01', to: '2019-12-31' },
  { id: '2020', label: '2020s', from: '2020-01-01', to: '2029-12-31' },
];

export const RATING_OPTIONS = [
  { value: 0,   label: 'Qualquer nota' },
  { value: 6,   label: '6.0+  Regular'    },
  { value: 7,   label: '7.0+  Bom'        },
  { value: 7.5, label: '7.5+  Muito bom'  },
  { value: 8,   label: '8.0+  Excelente'  },
];
