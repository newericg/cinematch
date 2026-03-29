// ─── Genre ───────────────────────────────────────────────────────────────────
export interface Genre {
  id: number;
  name: string;
}

// ─── Movie / TV Show ─────────────────────────────────────────────────────────
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: 'movie' | 'tv' | 'person';
  popularity: number;
  original_language: string;
}

export interface MovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  genres: Genre[];
  tagline?: string;
  status: string;
  spoken_languages: { name: string; english_name: string }[];
  production_countries: { name: string }[];
  media_type?: 'movie' | 'tv';
}

// ─── Search ───────────────────────────────────────────────────────────────────
export interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv' | 'person';
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

// ─── Video ───────────────────────────────────────────────────────────────────
export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

// ─── Watch Provider ──────────────────────────────────────────────────────────
export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface ProviderRegion {
  link: string;
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
}

export interface ProviderResult {
  id: number;
  results: Record<string, ProviderRegion>;
}

// ─── API Responses ───────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

// ─── App State ───────────────────────────────────────────────────────────────
export type ContentType = 'movie' | 'tv' | 'anime';
export type ActiveTab = 'mood' | 'genre' | 'similar';

export interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  description: string;
  genreIds: number[];
}

export interface AppState {
  activeTab: ActiveTab;
  contentType: ContentType;
  selectedMood: MoodOption | null;
  selectedGenres: Set<number>;
  selectedReference: SearchResult | null;
  results: Movie[];
  loading: boolean;
  error: string | null;
}

// ─── Mood definitions ────────────────────────────────────────────────────────
export const MOODS: MoodOption[] = [
  { id: 'laugh',     emoji: '😂', label: 'Quero rir',           description: 'Comédias e filmes de família',         genreIds: [35, 10751] },
  { id: 'cry',       emoji: '😭', label: 'Quero chorar',         description: 'Dramas e romances emocionantes',       genreIds: [18, 10749] },
  { id: 'adrenaline',emoji: '🔥', label: 'Quero adrenalina',     description: 'Ação, aventura e ficção científica',   genreIds: [28, 12, 878] },
  { id: 'scare',     emoji: '😱', label: 'Quero me assustar',    description: 'Terror e suspense',                    genreIds: [27, 53] },
  { id: 'fantasy',   emoji: '🚀', label: 'Quero me perder',      description: 'Ficção científica e fantasia',         genreIds: [878, 14] },
  { id: 'mystery',   emoji: '🧩', label: 'Quero um mistério',    description: 'Mistério e thriller',                  genreIds: [9648, 53] },
  { id: 'love',      emoji: '💕', label: 'Quero me apaixonar',   description: 'Romance e dramas do coração',          genreIds: [10749, 18] },
  { id: 'learn',     emoji: '🌍', label: 'Quero aprender',       description: 'Documentários e histórico',            genreIds: [99, 36] },
];

export const ALL_GENRES: Genre[] = [
  { id: 28,    name: 'Ação' },
  { id: 12,    name: 'Aventura' },
  { id: 16,    name: 'Animação' },
  { id: 35,    name: 'Comédia' },
  { id: 80,    name: 'Crime' },
  { id: 99,    name: 'Documentário' },
  { id: 18,    name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14,    name: 'Fantasia' },
  { id: 36,    name: 'História' },
  { id: 27,    name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648,  name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878,   name: 'Ficção Científica' },
  { id: 10770, name: 'Filme de TV' },
  { id: 53,    name: 'Suspense' },
  { id: 10752, name: 'Guerra' },
];
