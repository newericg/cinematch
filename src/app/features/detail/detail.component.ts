import {
  Component,
  inject,
  input,
  output,
  OnInit,
  HostListener,
  signal,
  computed,
} from '@angular/core';
import type { Movie, MovieDetail, Video, Provider } from '../../core/models/movie.model';
import { TmdbService } from '../../core/services/tmdb.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit {
  readonly movie       = input.required<Movie>();
  readonly contentType = input<'movie' | 'tv'>('movie');
  readonly closed      = output<void>();

  private readonly tmdb            = inject(TmdbService);
  protected readonly watchlistService = inject(WatchlistService);

  protected readonly imageBase = environment.tmdbImageBase;
  protected readonly detail    = signal<MovieDetail | null>(null);
  protected readonly videos    = signal<Video[]>([]);
  protected readonly providers = signal<Provider[]>([]);
  protected readonly loading   = signal(true);

  protected readonly trailer = computed(() => {
    const vids = this.videos();
    return vids.find(v => v.type === 'Trailer') ?? vids[0] ?? null;
  });

  protected readonly backdropUrl = computed(() => {
    const bp = this.detail()?.backdrop_path ?? this.movie().backdrop_path;
    return bp ? `${this.imageBase}/w1280${bp}` : null;
  });

  protected readonly posterUrl = computed(() => {
    const p = this.detail()?.poster_path ?? this.movie().poster_path;
    return p ? `${this.imageBase}/w342${p}` : 'assets/placeholder.svg';
  });

  ngOnInit(): void {
    const id   = this.movie().id;
    const type = this.contentType();

    this.tmdb.getDetail(id, type).subscribe({
      next: d => {
        this.detail.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.tmdb.getVideos(id, type).subscribe({
      next: v => this.videos.set(v),
      error: () => {},
    });

    this.tmdb.getWatchProviders(id, type).subscribe({
      next: p => {
        const br = p.results['BR'];
        this.providers.set(br?.flatrate ?? []);
      },
      error: () => {},
    });
  }

  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('detail-backdrop')) {
      this.closed.emit();
    }
  }

  protected get title(): string {
    return this.detail()?.title ?? this.detail()?.name ?? this.movie().title ?? this.movie().name ?? '';
  }

  protected get year(): string {
    const d = this.detail()?.release_date ?? this.detail()?.first_air_date ?? '';
    return d ? d.slice(0, 4) : '';
  }

  protected get runtime(): string {
    const rt = this.detail()?.runtime;
    const ert = this.detail()?.episode_run_time?.[0];
    const mins = rt ?? ert;
    if (!mins) return '';
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  }

  protected get rating(): string {
    return this.detail()?.vote_average?.toFixed(1) ?? this.movie().vote_average?.toFixed(1) ?? '—';
  }

  protected providerLogoUrl(path: string): string {
    return `${this.imageBase}/w45${path}`;
  }

  protected trailerUrl(key: string): string {
    return `https://www.youtube.com/watch?v=${key}`;
  }

  protected toggleWatchlist(): void {
    const m = this.movie();
    this.watchlistService.toggle({
      id:           m.id,
      title:        this.title,
      poster_path:  m.poster_path,
      vote_average: m.vote_average,
      media_type:   this.contentType(),
    });
  }
}
