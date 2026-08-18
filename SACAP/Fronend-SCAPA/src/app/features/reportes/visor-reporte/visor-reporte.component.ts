import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ReportesService, ReporteRespuesta } from '../../../core/services/reportes.service';
import { ReporteTablaComponent } from '../reporte-tabla/reporte-tabla.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

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
    if (filtrosRaw.fechaInicio) filtros.fechaInicio = filtrosRaw.fechaInicio;
    if (filtrosRaw.fechaFin) filtros.fechaFin = filtrosRaw.fechaFin;
    if (filtrosRaw.idProducto) filtros.idProducto = filtrosRaw.idProducto;
    if (filtrosRaw.idCliente) filtros.idCliente = filtrosRaw.idCliente;

    this.reportesService.getReporte(ruta, filtros).subscribe({
      next: (res) => {
        this.reporteData = res;
        this.tituloReporte = res.titulo;
        this.loading = false;
        
        if (this.showChart && res.data.length > 0) {
          this.prepararGrafico(res.data);
        }
      },
      error: (err) => {
        this.errorMsg = 'No se pudo cargar el reporte. Verifica tus permisos o la conexión.';
        this.toast.error('Error', this.errorMsg);
        this.loading = false;
      }
    });
  }

  onSubmitFiltros(): void {
    this.cargarReporte();
  }

  exportarCSV(): void {
    if (!this.reporteData || !this.reporteData.data || this.reporteData.data.length === 0) {
      this.toast.info('Info', 'No hay datos para exportar.');
      return;
    }

    const data = this.reporteData.data;
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
}
