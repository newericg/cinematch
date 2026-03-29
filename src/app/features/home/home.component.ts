import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TmdbService } from '../../core/services/tmdb.service';
import { WatchlistService } from '../../core/services/watchlist.service';
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
  protected readonly watchlistService = inject(WatchlistService);
  private readonly tmdb               = inject(TmdbService);

  protected readonly imageBase      = environment.tmdbImageBase;
  protected readonly loading        = signal(true);
  protected readonly featuredMovie  = signal<Movie | null>(null);
  protected readonly trendingMovies = signal<Movie[]>([]);
  protected readonly selectedMovie  = signal<Movie | null>(null);

  protected get heroBackdrop(): string | null {
    const m = this.featuredMovie();
    return m?.backdrop_path ? `${this.imageBase}/w1280${m.backdrop_path}` : null;
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

  protected get editionLabel(): string {
    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  protected get gridMovies(): Movie[] {
    const featured = this.featuredMovie();
    return this.trendingMovies()
      .filter(m => m.id !== featured?.id)
      .slice(0, 12);
  }

  ngOnInit(): void {
    this.tmdb.getTrending('movie').subscribe({
      next: movies => {
        if (movies.length) this.featuredMovie.set(movies[0]);
        this.trendingMovies.set(movies);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
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

  protected matchPercent(movie: Movie): number {
    return Math.min(99, Math.round(movie.vote_average * 9.9));
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
