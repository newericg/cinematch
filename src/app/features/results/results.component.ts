import { Component, input, signal } from '@angular/core';
import type { Movie, ContentType } from '../../core/models/movie.model';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { DetailComponent } from '../detail/detail.component';

@Component({
  selector: 'app-results',
  imports: [MovieCardComponent, DetailComponent],
  template: `
    <div class="results-header">
      <h2 class="results-header__title">
        {{ movies().length }} títulos encontrados
      </h2>
    </div>
    <div class="results-grid">
      @for (movie of movies(); track movie.id; let i = $index) {
        <app-movie-card
          [movie]="movie"
          [contentType]="contentType()"
          [style.animation-delay]="(i * 60) + 'ms'"
          (openDetail)="openDetail($event)"
        />
      }
    </div>

    @if (detailMovie()) {
      <app-detail
        [movie]="detailMovie()!"
        [contentType]="detailContentType()"
        (closed)="closeDetail()"
      />
    }
  `,
  styleUrl: './results.component.scss',
})
export class ResultsComponent {
  readonly movies      = input.required<Movie[]>();
  readonly contentType = input<ContentType>('movie');

  protected readonly detailMovie       = signal<Movie | null>(null);
  protected readonly detailContentType = signal<'movie' | 'tv'>('movie');

  protected openDetail(movie: Movie): void {
    const type = movie.media_type === 'movie' || (!movie.media_type && !!movie.title)
      ? 'movie'
      : 'tv';
    this.detailMovie.set(movie);
    this.detailContentType.set(type);
    document.body.style.overflow = 'hidden';
  }

  protected closeDetail(): void {
    this.detailMovie.set(null);
    document.body.style.overflow = '';
  }
}
