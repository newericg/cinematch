import { Component, inject, signal } from '@angular/core';
import { AppStateService } from '../../core/services/app-state.service';
import { TmdbService } from '../../core/services/tmdb.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiKeyService } from '../../core/services/api-key.service';
import type { ActiveTab, ContentType } from '../../core/models/movie.model';
import { MoodTabComponent } from './mood-tab/mood-tab.component';
import { GenreTabComponent } from './genre-tab/genre-tab.component';
import { SimilarTabComponent } from './similar-tab/similar-tab.component';
import { ResultsComponent } from '../results/results.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-discover',
  imports: [
    MoodTabComponent,
    GenreTabComponent,
    SimilarTabComponent,
    ResultsComponent,
    LoadingSkeletonComponent,
  ],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.scss',
})
export class DiscoverComponent {
  protected readonly stateService = inject(AppStateService);
  private readonly tmdb           = inject(TmdbService);
  private readonly toast          = inject(ToastService);
  private readonly apiKeyService  = inject(ApiKeyService);

  protected readonly tabs: { id: ActiveTab; label: string }[] = [
    { id: 'mood',    label: '😌 Humor' },
    { id: 'genre',   label: '🎬 Gênero' },
    { id: 'similar', label: '🔍 Similar a...' },
  ];

  protected readonly contentTypes: { id: ContentType; label: string }[] = [
    { id: 'movie', label: '🎬 Filmes' },
    { id: 'tv',    label: '📺 Séries' },
    { id: 'anime', label: '⛩️ Animes' },
  ];

  protected setTab(tab: ActiveTab): void {
    this.stateService.setActiveTab(tab);
  }

  protected setContentType(type: ContentType): void {
    this.stateService.setContentType(type);
    this.performSearch();
  }

  protected performSearch(): void {
    if (!this.apiKeyService.hasKey()) {
      this.toast.error('Configure sua API Key do TMDB primeiro!');
      return;
    }

    const tab         = this.stateService.activeTab();
    const contentType = this.stateService.contentType();
    const type        = contentType === 'anime' ? 'tv' : contentType;
    const isAnime     = contentType === 'anime';

    if (tab === 'mood') {
      const mood = this.stateService.selectedMood();
      if (!mood) return;
      const genreIds = type === 'tv' ? mood.tvGenreIds : mood.genreIds;
      this.stateService.setLoading(true);
      this.tmdb.discoverByGenres(type, genreIds, isAnime).subscribe({
        next:  results => this.stateService.setResults(results),
        error: err => {
          this.stateService.setError('Erro ao buscar títulos. Tente novamente.');
          this.toast.error('Erro na busca. Verifique sua API Key.');
        },
      });
    } else if (tab === 'genre') {
      const genres = Array.from(this.stateService.selectedGenres());
      if (!genres.length) return;
      this.stateService.setLoading(true);
      this.tmdb.discoverByGenres(type, genres, isAnime).subscribe({
        next:  results => this.stateService.setResults(results),
        error: () => {
          this.stateService.setError('Erro ao buscar títulos. Tente novamente.');
          this.toast.error('Erro na busca. Verifique sua API Key.');
        },
      });
    } else if (tab === 'similar') {
      const ref = this.stateService.selectedReference();
      if (!ref) return;
      const refType = ref.media_type === 'movie' ? 'movie' : 'tv';
      this.stateService.setLoading(true);
      this.tmdb.getRecommendations(ref.id, refType).subscribe({
        next:  results => this.stateService.setResults(results),
        error: () => {
          this.stateService.setError('Erro ao buscar recomendações.');
          this.toast.error('Erro na busca. Verifique sua API Key.');
        },
      });
    }
  }
}
