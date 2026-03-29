import {
  Component,
  inject,
  signal,
  output,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TmdbService } from '../../../core/services/tmdb.service';
import { AppStateService } from '../../../core/services/app-state.service';
import type { SearchResult } from '../../../core/models/movie.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-similar-tab',
  imports: [FormsModule],
  templateUrl: './similar-tab.component.html',
  styleUrl: './similar-tab.component.scss',
})
export class SimilarTabComponent implements OnInit {
  protected readonly tmdb         = inject(TmdbService);
  protected readonly stateService = inject(AppStateService);
  private readonly destroyRef     = inject(DestroyRef);

  protected readonly query       = signal('');
  protected readonly suggestions = signal<SearchResult[]>([]);
  protected readonly showDrop    = signal(false);
  protected readonly searching   = signal(false);

  private readonly query$ = new Subject<string>();

  readonly search = output<void>();

  protected readonly imageBase = environment.tmdbImageBase;

  ngOnInit(): void {
    this.query$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(q => {
          if (q.trim().length < 2) {
            this.suggestions.set([]);
            this.showDrop.set(false);
            this.searching.set(false);
            return [];
          }
          this.searching.set(true);
          return this.tmdb.searchMulti(q);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: results => {
          this.searching.set(false);
          this.suggestions.set(results.slice(0, 8));
          this.showDrop.set(results.length > 0);
        },
        error: () => this.searching.set(false),
      });
  }

  protected onQueryChange(value: string): void {
    this.query.set(value);
    this.query$.next(value);
  }

  protected selectItem(item: SearchResult): void {
    this.stateService.setSelectedReference(item);
    this.query.set('');
    this.suggestions.set([]);
    this.showDrop.set(false);
    this.search.emit();
  }

  protected removeReference(): void {
    this.stateService.setSelectedReference(null);
  }

  protected getTitle(item: SearchResult): string {
    return item.title ?? item.name ?? '';
  }

  protected getYear(item: SearchResult): string {
    const d = item.release_date ?? item.first_air_date ?? '';
    return d ? d.slice(0, 4) : '';
  }

  protected posterUrl(path: string | null): string {
    return path ? `${this.imageBase}/w92${path}` : 'assets/placeholder.svg';
  }

  protected hideDrop(): void {
    setTimeout(() => this.showDrop.set(false), 200);
  }
}
