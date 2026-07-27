import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
    .avatar-root {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      flex-shrink: 0;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0,0,0,.15);
      overflow: hidden;
      position: relative;
    }
    .avatar-root img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      display: block;
    }
  `],
  template: `
    <div class="avatar-root" [style]="avatarStyle()">
      @if (displayUrl()) {
        <img [src]="displayUrl()" alt="Avatar">
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

  avatarStyle = computed(() => {
    const s = this._size();
    const sizeMap: Record<string, string> = {
      sm: '28px',
      md: '36px',
      lg: '44px',
      xl: '80px',
    };
    const fontMap: Record<string, string> = {
      sm: '11px',
      md: '14px',
      lg: '16px',
      xl: '24px',
    };
    const dim = sizeMap[s] ?? '36px';
    const font = fontMap[s] ?? '14px';

    const colors = ['#0B4628', '#2563EB', '#7C3AED', '#D97706', '#475569', '#0D9488'];
    const charCode = this._name().charCodeAt(0) || 0;
    const bg = colors[charCode % colors.length];

    return `width:${dim};height:${dim};min-width:${dim};min-height:${dim};font-size:${font};background-color:${bg};`;
  });
}
