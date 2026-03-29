import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { ProfileService } from './core/services/profile.service';
import { WatchlistService } from './core/services/watchlist.service';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, OnboardingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly profileService   = inject(ProfileService);
  protected readonly watchlistService = inject(WatchlistService);
  private readonly stateService       = inject(AppStateService);

  protected resetProfile(): void {
    this.stateService.clearGeminiResponse();
    this.profileService.clear();
  }
}
