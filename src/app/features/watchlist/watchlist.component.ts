import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WatchlistService } from '../../core/services/watchlist.service';
import { environment } from '../../../environments/environment';
import type { WatchlistItem } from '../../core/models/profile.model';

@Component({
  selector: 'app-watchlist',
  imports: [RouterLink],
  templateUrl: './watchlist.component.html',
})
export class WatchlistComponent {
  protected readonly watchlistService = inject(WatchlistService);
  protected readonly imageBase = environment.tmdbImageBase;

  protected posterUrl(path: string | null): string {
    return path ? `${this.imageBase}/w342${path}` : 'placeholder.svg';
  }

  protected getYear(item: WatchlistItem): string {
    return item.addedAt ? new Date(item.addedAt).getFullYear().toString() : '';
  }
}
