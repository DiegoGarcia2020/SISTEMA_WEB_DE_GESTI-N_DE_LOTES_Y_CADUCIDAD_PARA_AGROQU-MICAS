import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService, UbicacionDetalleQrDTO } from '../../../core/services/inventario.service';

@Component({
  selector: 'app-auditoria-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria-qr.component.html',
  styleUrl:    './auditoria-qr.component.css'
})
export class AuditoriaQrComponent implements OnInit {

  private inventario = inject(InventarioService);

  // Escaneo manual / cámara
  codigoQrBusqueda = '';
  buscando = signal(false);
  error = signal('');
  exito = signal('');

  // Detalle ubicación escaneada
  ubicacion = signal<UbicacionDetalleQrDTO | null>(null);

  // Conteo físico ingresado por el bodeguero
  conteoFisicoReal: number = 0;
  observacionesAudit: string = '';
  guardandoAudit = signal(false);

  // Cálculo del stock real en sistema (suma de lotes almacenados o capacidadActual)
  get stockSistema(): number {
    const u = this.ubicacion();
    if (!u) return 0;
    if (u.lotesAlmacenados && u.lotesAlmacenados.length > 0) {
      const sumaLotes = u.lotesAlmacenados.reduce((acc, l) => acc + (l.cantidadActual || l.cantidadInicial || 0), 0);
      return Math.max(sumaLotes, u.capacidadActual || 0);
    }
    return u.capacidadActual || 0;
  }

  get porcentajeOcupacion(): number {
    const u = this.ubicacion();
    if (!u || !u.capacidadMaxima) return 0;
    return Math.min(100, Math.round((this.stockSistema / u.capacidadMaxima) * 100));
  }

  // Código QR limpio para mostrar siempre
  get codigoQrMostrado(): string {
    const u = this.ubicacion();
    if (!u) return '';
    if (u.codigoQr && u.codigoQr.trim() !== '') return u.codigoQr.trim();
    if (this.codigoQrBusqueda && this.codigoQrBusqueda.trim() !== '') return this.codigoQrBusqueda.trim();
    return `UBIC-EST${u.codigoEstanteria || 'A1'}-N${u.nivel || '1'}-P${u.posicion || 'A'}`;
  }

  // Descripción limpia (elimina duplicación de palabras como "Nivel Nivel" o "Pos. Posición")
  get descripcionLimpia(): string {
    const u = this.ubicacion();
    if (!u) return '';
    let desc = u.descripcionCompleta || '';
    desc = desc.replace(/Nivel\s+Nivel/gi, 'Nivel')
               .replace(/Pos\.\s+Posición/gi, 'Posición')
               .replace(/Pos\.\s+Pos/gi, 'Pos.');
    return desc;
  }

  // Cálculo de descuadre
  get descuadre(): number {
    return this.conteoFisicoReal - this.stockSistema;
  }

  ngOnInit() {}

  buscarPorQr() {
    if (!this.codigoQrBusqueda.trim()) return;

    this.buscando.set(true);
    this.error.set('');
    this.exito.set('');
    this.ubicacion.set(null);

    this.inventario.getUbicacionPorQr(this.codigoQrBusqueda.trim()).subscribe({
      next: data => {
        this.ubicacion.set(data);
        this.conteoFisicoReal = this.stockSistema;
        this.buscando.set(false);
      },
      error: () => {
        this.error.set('No se encontró ninguna ubicación para el código QR ingresado.');
        this.buscando.set(false);
      }
    });
  }

  camaraActiva = signal(false);

  async activarCamara() {
    this.camaraActiva.set(true);
    this.error.set('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        // Si el navegador tiene BarcodeDetector nativo
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          const videoEl = document.createElement('video');
          videoEl.srcObject = stream;
          await videoEl.play();

          const detectLoop = async () => {
            if (!this.camaraActiva()) {
              stream.getTracks().forEach(track => track.stop());
              return;
            }
            try {
              const barcodes = await barcodeDetector.detect(videoEl);
              if (barcodes.length > 0) {
                const qrText = barcodes[0].rawValue;
                this.codigoQrBusqueda = qrText;
                this.camaraActiva.set(false);
                stream.getTracks().forEach(track => track.stop());
                this.buscarPorQr();
                return;
              }
            } catch (e) {}
            requestAnimationFrame(detectLoop);
          };
          detectLoop();
        } else {
          // Fallback notificación de escáner
          this.exito.set('Cámara iniciada. Apunte al código QR o use la lectura por teclado del colector industrial.');
        }
      }
    } catch (err) {
      this.camaraActiva.set(false);
      this.error.set('No se pudo acceder a la cámara. Por favor ingrese o escanee el código QR manualmente.');
    }
  }

  // Simular escaneo de QR rápido de prueba
  simularEscaneo(codigo: string) {
    this.codigoQrBusqueda = codigo;
    this.buscarPorQr();
  }

  guardarAuditoria() {
    const u = this.ubicacion();
    if (!u) return;

    this.guardandoAudit.set(true);
    this.error.set('');
    this.exito.set('');

    this.inventario.registrarConteoFisico(u.idUbicacion, this.conteoFisicoReal, this.observacionesAudit).subscribe({
      next: res => {
        this.ubicacion.set(res);
        this.guardandoAudit.set(false);
        if (this.descuadre !== 0) {
          this.exito.set(`Auditoría registrada con descuadre de ${this.descuadre > 0 ? '+' : ''}${this.descuadre} unidades. Se generó reporte de ajuste.`);
        } else {
          this.exito.set('Conteo físico conforme. Sistema y stock físico coinciden perfectamente.');
        }
      },
      error: err => {
        this.guardandoAudit.set(false);
        this.error.set(err.error?.message || 'Error al guardar la auditoría.');
      }
    });
  }

  limpiar() {
    this.codigoQrBusqueda = '';
    this.ubicacion.set(null);
    this.error.set('');
    this.exito.set('');
  }
}
