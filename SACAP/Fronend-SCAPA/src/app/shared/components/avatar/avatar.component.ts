import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="avatarClass()" class="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 select-none shadow-sm overflow-hidden relative">
      @if (displayUrl()) {
        <img [src]="displayUrl()" alt="Avatar" class="w-full h-full object-cover rounded-full">
      } @else {
        <span>{{ initials() }}</span>
      }
    </div>
  `
})
export class AvatarComponent {
  private _name = signal<string>('');
  private _size = signal<'sm' | 'md' | 'lg' | 'xl'>('md');
  private _imageUrl = signal<string | undefined>(undefined);

  @Input() set name(val: string | undefined) {
    this._name.set(val || 'U');
  }

  @Input() set size(val: 'sm' | 'md' | 'lg' | 'xl') {
    this._size.set(val || 'md');
  }

  @Input() set imageUrl(val: string | undefined) {
    this._imageUrl.set(val);
  }

  displayUrl = computed(() => {
    if (this._imageUrl()) return this._imageUrl();
    // Si el nombre contiene admin o agrosense, intentar leer de localStorage la foto guardada en fase 2
    const n = this._name().toLowerCase();
    if (n.includes('admin') || n.includes('mendoza') || n.includes('agrosense')) {
      const local = localStorage.getItem('sacpa_admin_foto');
      if (local) return local;
    }
    return undefined;
  });

  initials = computed(() => {
    const n = this._name().trim();
    if (!n) return 'U';
    return n
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() || '')
      .join('');
  });

  avatarClass = computed(() => {
    const s = this._size();
    const sz = s === 'sm' ? 'w-7 h-7 text-[11px]' : s === 'lg' ? 'w-11 h-11 text-base' : s === 'xl' ? 'w-20 h-20 text-2xl' : 'w-9 h-9 text-sm';
    
    const colors = ['bg-[#0B4628]', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-slate-600', 'bg-teal-600'];
    const charCode = this._name().charCodeAt(0) || 0;
    const color = colors[charCode % colors.length];

    return `${sz} ${color}`;
  });
}
