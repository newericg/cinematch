import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  readonly apiKey = signal(environment.tmdbApiKey);
  readonly hasKey = computed(() => this.apiKey().trim().length > 0);
}
