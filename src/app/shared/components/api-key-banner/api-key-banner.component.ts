import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiKeyService } from '../../../core/services/api-key.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-api-key-banner',
  imports: [FormsModule],
  template: `
    @if (!apiKeyService.hasKey()) {
      <div class="banner">
        <div class="banner__inner">
          <div class="banner__icon">🔑</div>
          <div class="banner__content">
            <h3>Configure sua API Key do TMDB</h3>
            <p>Para usar o CineMatch, insira sua chave gratuita do <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">TMDB</a>.</p>
          </div>
          <div class="banner__form">
            <input
              [(ngModel)]="inputKey"
              type="text"
              placeholder="Cole sua API Key aqui..."
              class="banner__input"
              (keydown.enter)="save()"
            />
            <button class="banner__btn" (click)="save()" [disabled]="!inputKey().trim()">
              Salvar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './api-key-banner.component.scss',
})
export class ApiKeyBannerComponent {
  protected readonly apiKeyService = inject(ApiKeyService);
  private readonly toastService    = inject(ToastService);

  protected readonly inputKey = signal('');

  protected save(): void {
    const key = this.inputKey().trim();
    if (!key) return;
    this.apiKeyService.setApiKey(key);
    this.toastService.success('API Key salva com sucesso!');
    this.inputKey.set('');
  }
}
