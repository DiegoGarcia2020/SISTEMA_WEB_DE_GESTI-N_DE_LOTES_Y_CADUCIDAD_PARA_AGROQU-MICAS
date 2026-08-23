import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ReportesService, ReporteRespuesta } from '../../../core/services/reportes.service';
import { ReporteTablaComponent } from '../reporte-tabla/reporte-tabla.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-visor-reporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ReporteTablaComponent],
  templateUrl: './visor-reporte.component.html',
  styleUrl: './visor-reporte.component.css'
})
export class VisorReporteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportesService = inject(ReportesService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  filtrosForm: FormGroup;
  reporteData: ReporteRespuesta | null = null;
  loading = false;
  errorMsg = '';
  
  categoria = '';
  reporteId = '';
  tituloReporte = 'Cargando Reporte...';

  paginaActual = 0;
  tamanioPagina = 50;
  totalRegistros = 0;

  // Mostrar gráficos simples (barras CSS)
  showChart = false;
  chartData: { label: string, value: number, percentage: number }[] = [];

  constructor() {
    // Por defecto, este mes
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

    this.filtrosForm = this.fb.group({
      fechaInicio: [primerDia],
      fechaFin: [ultimoDia],
      idProducto: [''],
      idCliente: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoria = params.get('categoria') || '';
      this.reporteId = params.get('reporteId') || '';
      
      // Decidir si mostrar gráfico según el reporteId
      this.showChart = ['productos-mas-vendidos', 'dia-mas-compras', 'rotacion-temporada', 'churn'].includes(this.reporteId);
      
      this.cargarReporte();
    });
  }

  cargarReporte(): void {
    if (!this.categoria || !this.reporteId) return;

    this.errorMsg = '';
    this.loading = true;
    const ruta = `${this.categoria}/${this.reporteId}`;
    const filtrosRaw = this.filtrosForm.value;
    
    // Validación de fechas
    if (filtrosRaw.fechaInicio && filtrosRaw.fechaFin) {
      if (filtrosRaw.fechaInicio > filtrosRaw.fechaFin) {
        this.errorMsg = 'La fecha de inicio no puede ser mayor a la fecha de fin.';
        this.loading = false;
        return;
      }
    }
    
    // Limpiar nulos
    const filtros: any = {};
    filtros.pagina = this.paginaActual;
    filtros.tamanio = this.tamanioPagina;
    if (filtrosRaw.fechaInicio) filtros.fechaInicio = filtrosRaw.fechaInicio;
    if (filtrosRaw.fechaFin) filtros.fechaFin = filtrosRaw.fechaFin;
    if (filtrosRaw.idProducto) filtros.idProducto = filtrosRaw.idProducto;
    if (filtrosRaw.idCliente) filtros.idCliente = filtrosRaw.idCliente;

    this.reportesService.getReporte(ruta, filtros).subscribe({
      next: (res) => {
        this.reporteData = res;
        this.tituloReporte = res.titulo;
        this.totalRegistros = res.total ?? res.data.length;
        this.loading = false;
        
        if (this.showChart && res.data.length > 0) {
          this.prepararGrafico(res.data);
        }
      },
      error: (err) => {
        console.error('[Reporte] fallo al cargar', this.categoria + '/' + this.reporteId, err);

        const status = err?.status ?? 0;
        const detalle = err?.error?.message
          || err?.error?.error
          || err?.message
          || 'Sin detalle del servidor';

        if (status === 0) {
          this.errorMsg = 'No se pudo contactar al servidor. Verifica que el backend esté corriendo.';
        } else if (status === 401 || status === 403) {
          this.errorMsg = 'No tienes permisos para consultar este reporte.';
        } else if (status >= 500) {
          this.errorMsg = `Error del servidor al generar el reporte (${status}): ${detalle}`;
        } else {
          this.errorMsg = `No se pudo cargar el reporte (${status}): ${detalle}`;
        }

        this.toast.error('Error', this.errorMsg);
        this.loading = false;
      }
    });
  }

  onSubmitFiltros(): void {
    this.paginaActual = 0;
    this.cargarReporte();
  }

  exportarCSV(): void {
    if (!this.reporteData || !this.reporteData.data || this.reporteData.data.length === 0) {
      this.toast.info('Info', 'No hay datos para exportar.');
      return;
    }

    this.loading = true;
    this.obtenerTodo().subscribe({
      next: (res) => {
        this.loading = false;
        const data = res.data;
        if (data.length === 0) return;
        
        if ((res.total ?? 0) > 500) {
          this.toast.info('Info', 'La exportación se limitó a 500 registros. Acote el rango de fechas.');
        }

        const headers = Object.keys(data[0]);
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of data) {
          const values = headers.map(header => {
            const val = row[header];
            const escaped = ('' + (val ?? '')).replace(/"/g, '""');
            return `"${escaped}"`;
          });
          csvRows.push(values.join(','));
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${this.reporteId}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error', 'No se pudieron obtener los datos para exportar.');
      }
    });
  }

  exportarPDF(): void {
    if (!this.reporteData || !this.reporteData.data || this.reporteData.data.length === 0) {
      this.toast.info('Info', 'No hay datos para exportar.');
      return;
    }

    this.loading = true;
    this.obtenerTodo().subscribe({
      next: (res) => {
        this.loading = false;
        const data = res.data;
        if (data.length === 0) return;

        if ((res.total ?? 0) > 500) {
          this.toast.info('Info', 'La exportación se limitó a 500 registros. Acote el rango de fechas.');
        }

        const doc = new jsPDF();
        const headers = Object.keys(data[0]);

        const body = data.map(row => {
          return headers.map(header => {
            const val = row[header];
            return val !== null && val !== undefined ? val.toString() : '';
          });
        });

        doc.text(this.tituloReporte, 14, 15);

        autoTable(doc, {
          head: [headers.map(h => h.toUpperCase().replace(/_/g, ' '))],
          body: body,
          startY: 20,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`reporte_${this.reporteId}_${new Date().toISOString().split('T')[0]}.pdf`);
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error', 'No se pudieron obtener los datos para exportar.');
      }
    });
  }

  private obtenerTodo(): Observable<ReporteRespuesta> {
    const ruta = `${this.categoria}/${this.reporteId}`;
    const filtrosRaw = this.filtrosForm.value;
    const filtros: any = { pagina: 0, tamanio: 500 };
    if (filtrosRaw.fechaInicio) filtros.fechaInicio = filtrosRaw.fechaInicio;
    if (filtrosRaw.fechaFin) filtros.fechaFin = filtrosRaw.fechaFin;
    if (filtrosRaw.idProducto) filtros.idProducto = filtrosRaw.idProducto;
    if (filtrosRaw.idCliente) filtros.idCliente = filtrosRaw.idCliente;
    return this.reportesService.getReporte(ruta, filtros);
  }

  private prepararGrafico(data: any[]): void {
    this.chartData = [];
    if (data.length === 0) return;

    // Buscar la primera columna de texto (label) y la primera columna numérica (value)
    const keys = Object.keys(data[0]);
    let labelKey = keys.find(k => typeof data[0][k] === 'string');
    let valueKey = keys.find(k => typeof data[0][k] === 'number');

    if (!labelKey) labelKey = keys[0];
    if (!valueKey) return; // No se puede graficar si no hay números

    // Obtener el máximo para calcular el porcentaje
    let max = 0;
    data.forEach(row => {
      const v = row[valueKey!];
      if (v > max) max = v;
    });

    // Limitar a los 10 primeros para no desbordar el gráfico
    const topData = data.slice(0, 10);

    this.chartData = topData.map(row => {
      const val = row[valueKey!] || 0;
      return {
        label: row[labelKey!],
        value: val,
        percentage: max > 0 ? (val / max) * 100 : 0
      };
    });
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalRegistros / this.tamanioPagina));
  }

  irPagina(nueva: number): void {
    if (nueva < 0 || nueva >= this.totalPaginas || nueva === this.paginaActual) return;
    this.paginaActual = nueva;
    this.cargarReporte();
  }
}
