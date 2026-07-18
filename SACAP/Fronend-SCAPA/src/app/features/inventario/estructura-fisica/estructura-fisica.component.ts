import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  InventarioService,
  AlmacenDTO, ZonaDTO, EstanteriaDTO, UbicacionDTO
} from '../../../core/services/inventario.service';

@Component({
  selector: 'app-estructura-fisica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estructura-fisica.component.html',
  styleUrl: './estructura-fisica.component.css'
})
export class EstructuraFisicaComponent implements OnInit {

  almacenes  = signal<AlmacenDTO[]>([]);
  zonas      = signal<ZonaDTO[]>([]);
  estanterias = signal<EstanteriaDTO[]>([]);
  ubicaciones = signal<UbicacionDTO[]>([]);

  almacenSel   = signal<AlmacenDTO   | null>(null);
  zonaSel      = signal<ZonaDTO      | null>(null);
  estanteriaSel = signal<EstanteriaDTO | null>(null);

  cargandoZonas       = signal(false);
  cargandoEstanterias = signal(false);
  cargandoUbicaciones = signal(false);
  error               = signal('');

  constructor(private inventario: InventarioService) {}

  ngOnInit() {
    this.inventario.getAlmacenes().subscribe({
      next:  a  => this.almacenes.set(a),
      error: _e => this.error.set('Error al cargar almacenes.')
    });
  }

  seleccionarAlmacen(alm: AlmacenDTO) {
    this.almacenSel.set(alm);
    this.zonaSel.set(null);
    this.estanteriaSel.set(null);
    this.zonas.set([]);
    this.estanterias.set([]);
    this.ubicaciones.set([]);
    this.cargandoZonas.set(true);

    this.inventario.getZonas(alm.idAlmacen).subscribe({
      next:  z  => { this.zonas.set(z); this.cargandoZonas.set(false); },
      error: _e => { this.error.set('Error al cargar zonas.'); this.cargandoZonas.set(false); }
    });
  }

  seleccionarZona(zona: ZonaDTO) {
    this.zonaSel.set(zona);
    this.estanteriaSel.set(null);
    this.estanterias.set([]);
    this.ubicaciones.set([]);
    this.cargandoEstanterias.set(true);

    this.inventario.getEstanterias(zona.idZona).subscribe({
      next:  e  => { this.estanterias.set(e); this.cargandoEstanterias.set(false); },
      error: _e => { this.error.set('Error al cargar estanterías.'); this.cargandoEstanterias.set(false); }
    });
  }

  seleccionarEstanteria(est: EstanteriaDTO) {
    this.estanteriaSel.set(est);
    this.ubicaciones.set([]);
    this.cargandoUbicaciones.set(true);

    this.inventario.getUbicaciones(est.idEstanteria).subscribe({
      next:  u  => { this.ubicaciones.set(u); this.cargandoUbicaciones.set(false); },
      error: _e => { this.error.set('Error al cargar ubicaciones.'); this.cargandoUbicaciones.set(false); }
    });
  }
}
