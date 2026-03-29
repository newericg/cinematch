import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  private readonly STORAGE_KEY = 'cinematch_tmdb_key';

  private readonly _apiKey = signal<string>(this.loadFromStorage());

  readonly apiKey = this._apiKey.asReadonly();
  readonly hasKey = computed(() => this._apiKey().trim().length > 0);

  private loadFromStorage(): string {
    try {
      return localStorage.getItem(this.STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  }

  setApiKey(key: string): void {
    const trimmed = key.trim();
    try {
      localStorage.setItem(this.STORAGE_KEY, trimmed);
    } catch {
      // localStorage unavailable in some contexts
    }
    this._apiKey.set(trimmed);
  }

  clearApiKey(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // noop
    }
    this._apiKey.set('');
  }
}
