import { Component, inject, output } from '@angular/core';
import { ALL_GENRES } from '../../../core/models/movie.model';
import { AppStateService } from '../../../core/services/app-state.service';
import { GenrePillComponent } from '../../../shared/components/genre-pill/genre-pill.component';

@Component({
  selector: 'app-genre-tab',
  imports: [GenrePillComponent],
  template: `
    <div class="genre-tab">
      <p class="genre-tab__hint">Selecione um ou mais gêneros para descobrir títulos:</p>
      <div class="genre-tab__pills">
        @for (genre of genres; track genre.id) {
          <app-genre-pill
            [genreId]="genre.id"
            [label]="genre.name"
            [active]="stateService.selectedGenres().has(genre.id)"
            (clicked)="toggle($event)"
          />
        }
      </div>
      @if (stateService.selectedGenres().size > 0) {
        <div class="genre-tab__actions">
          <button class="genre-tab__clear" (click)="stateService.clearGenres()" type="button">
            Limpar seleção ({{ stateService.selectedGenres().size }})
          </button>
          <button class="genre-tab__search" (click)="search.emit()" type="button">
            Buscar →
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './genre-tab.component.scss',
})
export class GenreTabComponent {
  protected readonly stateService = inject(AppStateService);
  protected readonly genres = ALL_GENRES;

  readonly search = output<void>();

  protected toggle(id: number): void {
    this.stateService.toggleGenre(id);
  }
}
