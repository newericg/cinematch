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
  selector: 'app-home',
  imports: [RouterLink, DetailComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly stateService     = inject(AppStateService);
  protected readonly profileService   = inject(ProfileService);
  protected readonly watchlistService = inject(WatchlistService);
  private readonly tmdb               = inject(TmdbService);

  protected readonly imageBase = environment.tmdbImageBase;

  protected readonly loading          = signal(true);
  protected readonly featuredMovie    = signal<Movie | null>(null);
  protected readonly suggestionResults = signal<Movie[][]>([]);
  protected readonly activeChip       = signal(0);
  protected readonly selectedMovie    = signal<Movie | null>(null);

  protected get geminiSuggestions() { return this.stateService.geminiSuggestions(); }
  protected get geminiGreeting()    { return this.stateService.geminiGreeting(); }

  protected get hasAI(): boolean {
    return this.geminiSuggestions.length > 0;
  }

  protected get activeSuggestions(): Movie[] {
    const results  = this.suggestionResults();
    const featured = this.featuredMovie();
    const arr      = results[this.activeChip()] ?? results[0] ?? [];
    return (featured ? arr.filter(m => m.id !== featured.id) : arr).slice(0, 12);
  }

  protected get heroBackdrop(): string | null {
    const m = this.featuredMovie();
    return m?.backdrop_path ? `${this.imageBase}/w1280${m.backdrop_path}` : null;
  }

  protected get featuredTitle(): string {
    const m = this.featuredMovie();
    return m?.title ?? m?.name ?? '';
  }

  protected get featuredYear(): string {
    const m = this.featuredMovie();
    const d = m?.release_date ?? m?.first_air_date ?? '';
    return d ? d.slice(0, 4) : '';
  }

  protected get featuredRating(): string {
    return this.featuredMovie()?.vote_average?.toFixed(1) ?? '';
  }

  protected get editionLabel(): string {
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  ngOnInit(): void {
    const suggestions = this.geminiSuggestions;
    const profile     = this.profileService.profile();

    const filters: ProfileFilters = profile
      ? { decades: profile.decades, minRating: profile.minRating, platformIds: profile.streamingPlatformIds }
      : {};

    const rawType    = profile?.contentType ?? 'all';
    const type: 'movie' | 'tv' = rawType === 'tv' ? 'tv' : 'movie';
    const isAnime    = rawType === 'anime';

    if (suggestions.length > 0) {
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
    } else {
      this.tmdb.getTrending(type).subscribe({
        next: movies => {
          this.suggestionResults.set([movies]);
          if (movies.length) this.featuredMovie.set(movies[0]);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  protected selectChip(index: number): void {
    this.activeChip.set(index);
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
}
