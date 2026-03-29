import { Injectable, computed, signal } from '@angular/core';
import type { UserProfile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly STORAGE_KEY = 'cinematch_profile';

  private readonly _profile = signal<UserProfile | null>(this.load());

  readonly profile    = this._profile.asReadonly();
  readonly hasProfile = computed(() => this._profile() !== null);

  private load(): UserProfile | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }

  save(profile: UserProfile): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    } catch { /* localStorage unavailable */ }
    this._profile.set(profile);
  }

  clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch { /* noop */ }
    this._profile.set(null);
  }
}
