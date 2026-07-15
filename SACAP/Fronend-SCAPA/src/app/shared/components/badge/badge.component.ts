import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass()" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium shadow-2xs select-none">
      @if (statusDot()) {
        <span [class]="statusDot()" class="w-1.5 h-1.5 rounded-full animate-pulse"></span>
      }
      <ng-content></ng-content>
      {{ label() }}
    </span>
  `
})
export class BadgeComponent {
  private _role = signal<string | null>(null);
  private _status = signal<number | string | null>(null);
  private _customClass = signal<string>('');

  @Input() set role(val: string | undefined | null) {
    this._role.set(val || null);
  }

  @Input() set status(val: number | string | undefined | null) {
    this._status.set(val !== undefined ? val! : null);
  }

  @Input() set customClass(val: string | undefined) {
    this._customClass.set(val || '');
  }

  label = computed(() => {
    const r = this._role();
    if (r) return r;
    const s = this._status();
    if (s !== null) {
      if (s === 1 || s === 'Activo') return 'Activo';
      if (s === 2 || s === 'Inactivo') return 'Inactivo';
      if (s === 3 || s === 'Bloqueado') return 'Bloqueado';
      return String(s);
    }
    return '';
  });

  statusDot = computed(() => {
    const s = this._status();
    if (s !== null) {
      if (s === 1 || s === 'Activo') return 'bg-green-500';
      if (s === 2 || s === 'Inactivo') return 'bg-gray-400';
      if (s === 3 || s === 'Bloqueado') return 'bg-red-500';
    }
    return null;
  });

  badgeClass = computed(() => {
    const custom = this._customClass();
    if (custom) return custom;

    const r = this._role();
    if (r) {
      const roleLower = r.toLowerCase();
      if (roleLower.includes('admin')) return 'bg-[#0B4628] text-white';
      if (roleLower.includes('supervis')) return 'bg-blue-600 text-white';
      if (roleLower.includes('bodeg')) return 'bg-purple-600 text-white';
      if (roleLower.includes('técnic') || roleLower.includes('tecnic') || roleLower.includes('campo')) return 'bg-amber-600 text-white';
      if (roleLower.includes('proveed')) return 'bg-slate-600 text-white';
      return 'bg-teal-700 text-white';
    }

    const s = this._status();
    if (s !== null) {
      if (s === 1 || s === 'Activo') return 'bg-green-100 text-green-800 border border-green-200';
      if (s === 2 || s === 'Inactivo') return 'bg-gray-100 text-gray-600 border border-gray-200';
      if (s === 3 || s === 'Bloqueado') return 'bg-red-100 text-red-700 border border-red-200';
    }

    return 'bg-gray-100 text-gray-800 border border-gray-200';
  });
}
