import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiKeyBannerComponent } from './shared/components/api-key-banner/api-key-banner.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ApiKeyService } from './core/services/api-key.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ApiKeyBannerComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly apiKeyService = inject(ApiKeyService);
  protected readonly toastService  = inject(ToastService);
}
