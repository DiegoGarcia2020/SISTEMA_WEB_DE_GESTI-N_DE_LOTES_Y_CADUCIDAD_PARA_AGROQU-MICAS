import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="checked"
      [disabled]="disabled"
      (click)="toggle()"
      [class]="disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'"
      [ngClass]="checked ? 'bg-[#0B4628]' : 'bg-gray-300'"
      class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0B4628]/30 shadow-2xs">
      <span
        [ngClass]="checked ? 'translate-x-4 bg-white' : 'translate-x-0.5 bg-white'"
        class="inline-block h-3.5 w-3.5 transform rounded-full shadow-md transition-transform duration-200 ease-in-out">
      </span>
    </button>
  `
})
export class ToggleSwitchComponent {
  @Input() checked = false;
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.checkedChange.emit(this.checked);
    }
  }
}
