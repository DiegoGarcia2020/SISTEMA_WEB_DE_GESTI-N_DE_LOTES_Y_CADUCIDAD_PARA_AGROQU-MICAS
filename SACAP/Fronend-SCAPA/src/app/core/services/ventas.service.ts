import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PeriodoVentas, VentasMasVendidosDTO } from '../models/ventas.model';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private mock: VentasMasVendidosDTO = {
    periodo: 'SEMANA',
    desde: '2026-08-03T00:00:00',
    hasta: '2026-08-10T00:00:00',
    top: 5,
    ranking: [
      { idProducto: 1, nombre: 'Urea Granulada 46%', unidades: 90, montoTotal: 3195.00, unidadesAnterior: 8, variacion: 1025 },
      { idProducto: 10, nombre: 'Semilla de Arroz SFL-11', unidades: 85, montoTotal: 5525.00, unidadesAnterior: 22, variacion: 286.4 },
      { idProducto: 9, nombre: 'Cipermetrina 25 EC', unidades: 60, montoTotal: 570.00, unidadesAnterior: 9, variacion: 566.7 },
      { idProducto: 2, nombre: 'Glifosato 480 SL', unidades: 53, montoTotal: 434.60, unidadesAnterior: 10, variacion: 430 },
      { idProducto: 6, nombre: 'NPK 15-15-15', unidades: 33, montoTotal: 1320.00, unidadesAnterior: 8, variacion: 312.5 }
    ],
    rankingAnterior: [
      { idProducto: 10, nombre: 'Semilla de Arroz SFL-11', unidades: 22, montoTotal: 1430.00 },
      { idProducto: 1, nombre: 'Urea Granulada 46%', unidades: 8, montoTotal: 284.00 },
      { idProducto: 9, nombre: 'Cipermetrina 25 EC', unidades: 9, montoTotal: 85.50 }
    ],
    analisis: {
      resumen: 'El producto líder es Urea Granulada 46% con 90 unidades vendidas, representando el 24.9% del total del período.',
      hallazgos: [
        'Urea Granulada 46%: 90 unidades (24.9% del total).',
        'Semilla de Arroz SFL-11: 85 unidades (23.5% del total).',
        'Cipermetrina 25 EC: 60 unidades (16.6% del total).',
        'El volumen total aumentó un 473% frente al período anterior.'
      ],
      tendencia: 'AL ALZA',
      alertaAltaDemanda: true,
      alertaMensaje: 'Alta demanda detectada: Urea Granulada 46% creció un 1025.0% vs el período anterior con 90 unidades vendidas. Se recomienda verificar stock disponible y planificar reabastecimiento.'
    },
    totalVentas: 18,
    totalUnidades: 361,
    totalMonto: 12694.60
  };

  masVendidos(periodo: PeriodoVentas, top: number, desde?: string, hasta?: string): Observable<VentasMasVendidosDTO> {
    let params = new HttpParams().set('periodo', periodo).set('top', String(top));
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<VentasMasVendidosDTO>(`${this.apiUrl}/ventas/mas-vendidos`, { params }).pipe(
      catchError(err => {
        if (err.status === 0 || err.status === 404) return of({ ...this.mock, periodo });
        return throwError(() => err);
      })
    );
  }

  exportar(formato: 'EXCEL' | 'PDF' | 'CSV', periodo: PeriodoVentas, desde?: string, hasta?: string): Observable<Blob> {
    let params = new HttpParams().set('formato', formato).set('periodo', periodo);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get(`${this.apiUrl}/ventas/mas-vendidos/exportar`, { params, responseType: 'blob' });
  }
}
