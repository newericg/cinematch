import { Component, inject, output } from '@angular/core';
import { MOODS, type MoodOption } from '../../../core/models/movie.model';
import { AppStateService } from '../../../core/services/app-state.service';

@Component({
  selector: 'app-mood-tab',
  templateUrl: './mood-tab.component.html',
  styleUrl: './mood-tab.component.scss',
})
export class MoodTabComponent {
  protected readonly stateService = inject(AppStateService);
  protected readonly moods = MOODS;

  readonly search = output<void>();

  protected selectMood(mood: MoodOption): void {
    const current = this.stateService.selectedMood();
    if (current?.id === mood.id) {
      this.stateService.setSelectedMood(null);
    } else {
      this.stateService.setSelectedMood(mood);
      this.search.emit();
    }
  }
}
