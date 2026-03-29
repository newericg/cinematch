import { Component, inject, signal } from '@angular/core';
import { ALL_GENRES } from '../../core/models/movie.model';
import {
  DECADES,
  RATING_OPTIONS,
  STREAMING_PLATFORMS,
  type UserProfile,
} from '../../core/models/profile.model';
import { AppStateService } from '../../core/services/app-state.service';
import { GeminiService } from '../../core/services/gemini.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  private readonly profileService = inject(ProfileService);
  private readonly geminiService  = inject(GeminiService);
  private readonly stateService   = inject(AppStateService);

  protected readonly step         = signal(1);
  protected readonly totalSteps   = 5;
  protected readonly generating   = signal(false);

  // Step data
  protected readonly selectedGenres    = signal<Set<number>>(new Set());
  protected readonly selectedContent   = signal<UserProfile['contentType']>('all');
  protected readonly selectedDecades   = signal<Set<string>>(new Set());
  protected readonly selectedPlatforms = signal<Set<number>>(new Set());
  protected readonly selectedRating    = signal<number>(0);

  // Static data for templates
  protected readonly genres    = ALL_GENRES;
  protected readonly decades   = DECADES;
  protected readonly platforms = STREAMING_PLATFORMS;
  protected readonly ratings   = RATING_OPTIONS;

  protected readonly contentOptions: { id: UserProfile['contentType']; emoji: string; label: string }[] = [
    { id: 'movie', emoji: '🎬', label: 'Filmes' },
    { id: 'tv',    emoji: '📺', label: 'Séries' },
    { id: 'anime', emoji: '⛩️', label: 'Anime' },
    { id: 'all',   emoji: '✨', label: 'Tudo' },
  ];

  protected get progress(): number {
    return (this.step() / this.totalSteps) * 100;
  }

  protected toggleGenre(id: number): void {
    this.selectedGenres.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected toggleDecade(id: string): void {
    this.selectedDecades.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected togglePlatform(id: number): void {
    this.selectedPlatforms.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected next(): void {
    if (this.step() < this.totalSteps) {
      this.step.update(s => s + 1);
    }
  }

  protected back(): void {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  protected finish(): void {
    const profile: UserProfile = {
      favoriteGenreIds:    Array.from(this.selectedGenres()),
      contentType:         this.selectedContent(),
      decades:             Array.from(this.selectedDecades()),
      streamingPlatformIds: Array.from(this.selectedPlatforms()),
      minRating:           this.selectedRating(),
    };

    this.generating.set(true);

    this.geminiService.getSuggestions(profile).subscribe({
      next: response => {
        this.stateService.setGeminiResponse(response);
        this.profileService.save(profile);
        this.generating.set(false);
      },
      error: () => {
        this.profileService.save(profile);
        this.generating.set(false);
      },
    });
  }

  protected skip(): void {
    const defaultProfile: UserProfile = {
      favoriteGenreIds:    [],
      contentType:         'all',
      decades:             [],
      streamingPlatformIds: [],
      minRating:           0,
    };
    this.profileService.save(defaultProfile);
  }
}
