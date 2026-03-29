import { Injectable, computed, signal } from '@angular/core';
import type { WatchlistItem } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly STORAGE_KEY = 'cinematch_watchlist';

  private readonly _items = signal<WatchlistItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);

  private load(): WatchlistItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._items()));
    } catch { /* noop */ }
  }

  isInWatchlist(id: number): boolean {
    return this._items().some(i => i.id === id);
  }

  toggle(item: Omit<WatchlistItem, 'addedAt'>): void {
    if (this.isInWatchlist(item.id)) {
      this._items.update(list => list.filter(i => i.id !== item.id));
    } else {
      this._items.update(list => [
        ...list,
        { ...item, addedAt: new Date().toISOString() },
      ]);
    }
    this.persist();
  }

  remove(id: number): void {
    this._items.update(list => list.filter(i => i.id !== id));
    this.persist();
  }
}
