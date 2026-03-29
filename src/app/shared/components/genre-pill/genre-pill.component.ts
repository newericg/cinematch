import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-genre-pill',
  template: `
    <button
      class="pill"
      [class.pill--active]="active()"
      (click)="clicked.emit(genreId())"
      type="button"
    >
      {{ label() }}
    </button>
  `,
  styleUrl: './genre-pill.component.scss',
})
export class GenrePillComponent {
  readonly genreId = input.required<number>();
  readonly label   = input.required<string>();
  readonly active  = input(false);
  readonly clicked = output<number>();
}
