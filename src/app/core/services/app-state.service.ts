import { Injectable, signal, computed } from '@angular/core';
import type { AppState, ActiveTab, ContentType, MoodOption, Movie, SearchResult } from '../models/movie.model';
import type { GeminiResponse, GeminiSuggestion } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly _state = signal<AppState>({
    activeTab: 'mood',
    contentType: 'movie',
    selectedMood: null,
    selectedGenres: new Set<number>(),
    selectedReference: null,
    results: [],
    loading: false,
    error: null,
  });

  readonly state = this._state.asReadonly();

  readonly activeTab    = computed(() => this._state().activeTab);
  readonly contentType  = computed(() => this._state().contentType);
  readonly selectedMood = computed(() => this._state().selectedMood);
  readonly selectedGenres = computed(() => this._state().selectedGenres);
  readonly selectedReference = computed(() => this._state().selectedReference);
  readonly results      = computed(() => this._state().results);
  readonly loading      = computed(() => this._state().loading);
  readonly error        = computed(() => this._state().error);

  setActiveTab(tab: ActiveTab): void {
    this._state.update(s => ({ ...s, activeTab: tab, results: [], error: null }));
  }

  setContentType(type: ContentType): void {
    this._state.update(s => ({ ...s, contentType: type, results: [], error: null }));
  }

  setSelectedMood(mood: MoodOption | null): void {
    this._state.update(s => ({ ...s, selectedMood: mood }));
  }

  toggleGenre(id: number): void {
    this._state.update(s => {
      const genres = new Set(s.selectedGenres);
      genres.has(id) ? genres.delete(id) : genres.add(id);
      return { ...s, selectedGenres: genres };
    });
  }

  clearGenres(): void {
    this._state.update(s => ({ ...s, selectedGenres: new Set<number>() }));
  }

  setSelectedReference(ref: SearchResult | null): void {
    this._state.update(s => ({ ...s, selectedReference: ref }));
  }

  setResults(results: Movie[]): void {
    this._state.update(s => ({ ...s, results, loading: false, error: null }));
  }

  setLoading(loading: boolean): void {
    this._state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null): void {
    this._state.update(s => ({ ...s, error, loading: false }));
  }

  // ─── Gemini (persisted to localStorage) ───────────────────────────────────
  private readonly GEMINI_KEY = 'cinematch_gemini';

  private loadGemini(): GeminiResponse {
    try {
      const raw = localStorage.getItem(this.GEMINI_KEY);
      return raw ? (JSON.parse(raw) as GeminiResponse) : { greeting: '', suggestions: [] };
    } catch {
      return { greeting: '', suggestions: [] };
    }
  }

  private readonly _cached               = this.loadGemini();
  private readonly _geminiGreeting       = signal<string>(this._cached.greeting);
  private readonly _geminiSuggestions    = signal<GeminiSuggestion[]>(this._cached.suggestions);

  readonly geminiGreeting    = this._geminiGreeting.asReadonly();
  readonly geminiSuggestions = this._geminiSuggestions.asReadonly();

  setGeminiResponse(response: GeminiResponse): void {
    this._geminiGreeting.set(response.greeting);
    this._geminiSuggestions.set(response.suggestions);
    try {
      localStorage.setItem(this.GEMINI_KEY, JSON.stringify(response));
    } catch { /* noop */ }
  }

  clearGeminiResponse(): void {
    this._geminiGreeting.set('');
    this._geminiSuggestions.set([]);
    try { localStorage.removeItem(this.GEMINI_KEY); } catch { /* noop */ }
  }
}
