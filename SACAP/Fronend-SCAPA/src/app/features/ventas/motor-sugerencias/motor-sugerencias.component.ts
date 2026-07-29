import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VentasService, CategoriaDTO } from '../../../core/services/ventas.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { CultivoDTO, PlagaDTO, SugerenciaComboDTO } from '../../../core/models/ventas.model';

type ModoBusqueda = 'categoria' | 'diagnostico';

@Component({
  selector: 'app-motor-sugerencias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './motor-sugerencias.component.html',
  styleUrl: './motor-sugerencias.component.css'
})
export class MotorSugerenciasComponent implements OnInit {
  private ventasService = inject(VentasService);
  private router = inject(Router);
  carrito = inject(CarritoService);

  modo = signal<ModoBusqueda>('diagnostico');

  categorias = signal<CategoriaDTO[]>([]);
  categoriaSeleccionada = signal<number | null>(null);

  cultivos = signal<CultivoDTO[]>([]);
  plagas = signal<PlagaDTO[]>([]);
  cultivoSeleccionado = signal<number | null>(null);
  plagaSeleccionada = signal<number | null>(null);

  sugerencias = signal<SugerenciaComboDTO[]>([]);
  cargando = signal(false);
  buscado = signal(false);

  ngOnInit() {
    this.ventasService.getCategorias().subscribe({ next: c => this.categorias.set(c || []) });
    this.ventasService.getCultivos().subscribe({ next: c => this.cultivos.set(c || []) });
    this.ventasService.getPlagas().subscribe({ next: p => this.plagas.set(p || []) });
  }

  cambiarModo(modo: ModoBusqueda) {
    this.modo.set(modo);
    this.buscado.set(false);
    this.sugerencias.set([]);
  }

  seleccionarCategoria(idCategoria: number) {
    this.categoriaSeleccionada.set(idCategoria);
    this.buscado.set(true);
    this.cargando.set(true);
    this.ventasService.getSugerencias(idCategoria).subscribe({
      next: s => { this.sugerencias.set(s || []); this.cargando.set(false); },
      error: () => { this.sugerencias.set([]); this.cargando.set(false); }
    });
  }

  seleccionarCultivo(idCultivo: number) {
    this.cultivoSeleccionado.set(this.cultivoSeleccionado() === idCultivo ? null : idCultivo);
    if (this.plagaSeleccionada() !== null) this.buscarPorDiagnostico();
  }

  seleccionarPlaga(idPlaga: number) {
    this.plagaSeleccionada.set(idPlaga);
    this.buscarPorDiagnostico();
  }

  private buscarPorDiagnostico() {
    const idPlaga = this.plagaSeleccionada();
    if (idPlaga === null) return;
    this.buscado.set(true);
    this.cargando.set(true);
    this.ventasService.getSugerenciasPorPlaga(idPlaga, this.cultivoSeleccionado()).subscribe({
      next: s => { this.sugerencias.set(s || []); this.cargando.set(false); },
      error: () => { this.sugerencias.set([]); this.cargando.set(false); }
    });
  }

  agregarAlCarrito(s: SugerenciaComboDTO) {
    for (const lote of s.lotes) {
      this.carrito.agregar({
        idLote: lote.idLote,
        numeroLote: lote.numeroLote,
        nombreProducto: lote.nombreProducto,
        cantidad: 1,
        precioUnitario: lote.precioUnitario,
        esComboIA: true,
        descuentoPct: s.descuentoSugerido
      });
    }
  }

  irACheckout() {
    this.router.navigate(['/admin/ventas/checkout']);
  }

  claseUrgencia(score: number): string {
    if (score >= 80) return 'critico';
    if (score >= 60) return 'alto';
    if (score >= 35) return 'medio';
    return 'bajo';
  }
}
