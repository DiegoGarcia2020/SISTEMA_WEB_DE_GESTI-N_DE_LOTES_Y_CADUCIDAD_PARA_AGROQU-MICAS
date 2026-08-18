import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-reporte-tabla',
  standalone: true,
  imports: [CommonModule],
  providers: [DecimalPipe],
  templateUrl: './reporte-tabla.component.html',
  styleUrl: './reporte-tabla.component.css'
})
export class ReporteTablaComponent {
  @Input() data: any[] = [];
  @Input() loading: boolean = false;

  get columns(): string[] {
    if (this.data && this.data.length > 0) {
      return Object.keys(this.data[0]);
    }
    return [];
  }

  formatHeader(key: string): string {
    return key.replace(/_/g, ' ').toUpperCase();
  }

  isDateColumn(key: string): boolean {
    return key.toLowerCase().includes('fecha');
  }

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }
}
