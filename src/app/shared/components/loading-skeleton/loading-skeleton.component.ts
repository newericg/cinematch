import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  template: `
    <div class="skeleton-grid">
      @for (item of items(); track item) {
        <div class="skeleton-card">
          <div class="skeleton-card__poster skeleton-shimmer"></div>
          <div class="skeleton-card__body">
            <div class="skeleton-card__title skeleton-shimmer"></div>
            <div class="skeleton-card__meta skeleton-shimmer"></div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './loading-skeleton.component.scss',
})
export class LoadingSkeletonComponent {
  readonly count = input(8);
  protected readonly items = computed(() =>
    Array.from({ length: this.count() }, (_, i) => i)
  );
}
