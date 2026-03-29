import { Component, input, output } from '@angular/core';
import type { Movie, ContentType } from '../../../core/models/movie.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
  host: { class: 'movie-card-host' },
})
export class MovieCardComponent {
  readonly movie       = input.required<Movie>();
  readonly contentType = input<ContentType>('movie');

  readonly openDetail = output<Movie>();

  protected readonly imageBase = environment.tmdbImageBase;

  protected get title(): string {
    return this.movie().title ?? this.movie().name ?? 'Sem título';
  }

  protected get year(): string {
    const d = this.movie().release_date ?? this.movie().first_air_date ?? '';
    return d ? d.slice(0, 4) : '';
  }

  protected get rating(): string {
    return this.movie().vote_average?.toFixed(1) ?? '—';
  }

  protected get ratingClass(): string {
    const r = this.movie().vote_average ?? 0;
    if (r >= 7.5) return 'high';
    if (r >= 6)   return 'mid';
    return 'low';
  }

  protected posterUrl(path: string | null): string {
    return path
      ? `${this.imageBase}/w342${path}`
      : 'assets/placeholder.svg';
  }
}
