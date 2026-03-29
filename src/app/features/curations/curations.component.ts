import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppStateService } from '../../core/services/app-state.service';
import { ProfileService } from '../../core/services/profile.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { TmdbService, type ProfileFilters } from '../../core/services/tmdb.service';
import { DetailComponent } from '../detail/detail.component';
import { environment } from '../../../environments/environment';
import type { Movie } from '../../core/models/movie.model';
import type { WatchlistItem } from '../../core/models/profile.model';

@Component({
  selector: 'app-curations',
  imports: [RouterLink, DetailComponent],
  templateUrl: './curations.component.html',
})
export class CurationsComponent implements OnInit {
  protected readonly stateService     = inject(AppStateService);
  protected readonly profileService   = inject(ProfileService);
  protected readonly watchlistService = inject(WatchlistService);
  private readonly tmdb               = inject(TmdbService);

  protected readonly imageBase         = environment.tmdbImageBase;
  protected readonly loading           = signal(true);
  protected readonly featuredMovie     = signal<Movie | null>(null);
  protected readonly suggestionResults = signal<Movie[][]>([]);
  protected readonly activeChip        = signal(0);
  protected readonly selectedMovie     = signal<Movie | null>(null);

  protected get geminiSuggestions() { return this.stateService.geminiSuggestions(); }
  protected get geminiGreeting()    { return this.stateService.geminiGreeting(); }
  protected get hasAI(): boolean    { return this.geminiSuggestions.length > 0; }

  protected get activeSuggestions(): Movie[] {
    const results  = this.suggestionResults();
    const featured = this.featuredMovie();
    const arr      = results[this.activeChip()] ?? results[0] ?? [];
    return (featured ? arr.filter(m => m.id !== featured.id) : arr).slice(0, 12);
  }

  protected get activeLabel(): string {
    return this.geminiSuggestions[this.activeChip()]?.label ?? 'Sugestões Personalizadas';
  }

  protected get featuredTitle(): string {
    const m = this.featuredMovie();
    return m?.title ?? m?.name ?? '';
  }

  protected get featuredYear(): string {
    const d = this.featuredMovie()?.release_date ?? this.featuredMovie()?.first_air_date ?? '';
    return d ? d.slice(0, 4) : '';
  }

  protected get featuredRating(): string {
    return this.featuredMovie()?.vote_average?.toFixed(1) ?? '';
  }

  ngOnInit(): void {
    const suggestions = this.geminiSuggestions;
    if (!suggestions.length) {
      this.loading.set(false);
      return;
    }

    const profile = this.profileService.profile();
    const filters: ProfileFilters = profile
      ? { decades: profile.decades, minRating: profile.minRating, platformIds: profile.streamingPlatformIds }
      : {};

    const rawType  = profile?.contentType ?? 'all';
    const type: 'movie' | 'tv' = rawType === 'tv' ? 'tv' : 'movie';
    const isAnime  = rawType === 'anime';

    forkJoin(
      suggestions.map(s => {
        const ids = type === 'tv' ? s.tvGenreIds : s.genreIds;
        return this.tmdb.discoverByGenres(type, ids, isAnime, filters);
      })
    ).subscribe({
      next: results => {
        this.suggestionResults.set(results);
        if (results[0]?.length) this.featuredMovie.set(results[0][0]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected selectChip(index: number): void {
    this.activeChip.set(index);
    const first = this.suggestionResults()[index]?.[0];
    if (first) this.featuredMovie.set(first);
  }

  protected matchPercent(movie: Movie): number {
    return Math.min(99, Math.round(movie.vote_average * 9.9));
  }

  protected posterUrl(path: string | null): string {
    return path ? `${this.imageBase}/w342${path}` : 'placeholder.svg';
  }

  protected backdropUrl(path: string | null): string {
    return path ? `${this.imageBase}/w780${path}` : '';
  }

  protected getTitle(m: Movie): string {
    return m.title ?? m.name ?? '';
  }

  protected getYear(m: Movie): string {
    const d = m.release_date ?? m.first_air_date ?? '';
    return d ? d.slice(0, 4) : '';
  }

  protected getDetailType(m: Movie): 'movie' | 'tv' {
    return m.media_type === 'tv' || (!!m.name && !m.title) ? 'tv' : 'movie';
  }

  protected toggleWatchlist(movie: Movie, event?: MouseEvent): void {
    event?.stopPropagation();
    this.watchlistService.toggle({
      id:           movie.id,
      title:        this.getTitle(movie),
      poster_path:  movie.poster_path,
      vote_average: movie.vote_average,
      media_type:   this.getDetailType(movie),
    } as Omit<WatchlistItem, 'addedAt'>);
  }

  protected resetProfile(): void {
    this.stateService.clearGeminiResponse();
    this.profileService.clear();
  }
}
