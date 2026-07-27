import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';

export interface ProductoCatalog {
  idProducto: number;
  nombre: string;
  unidadMedida: string;
  precio: number;
  instruccionesAplicacion?: string;
  cultivo?: string;
  plaga?: string;
}

export interface ClienteCatalog {
  idCliente: number;
  nombreFinca: string;
  cedula: string;
}

export interface CartItem {
  producto: ProductoCatalog;
  cantidad: number;
}

@Component({
  selector: 'app-punto-venta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './punto-venta.component.html',
  styleUrls: ['./punto-venta.component.css']
})
export class PuntoVentaComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  isLoading = signal<boolean>(false);

  // Mocks por ahora
  clientes = signal<ClienteCatalog[]>([
    { idCliente: 1, nombreFinca: 'Finca La Esperanza', cedula: '0912345678' },
    { idCliente: 2, nombreFinca: 'Hacienda San José', cedula: '1723456789' }
  ]);

  // Lista maestra de productos (mock)
  todosLosProductos: ProductoCatalog[] = [
    { idProducto: 1, nombre: 'Fertilizante Urea 46%', unidadMedida: 'Saco 50kg', precio: 35.50, instruccionesAplicacion: 'Aplicar 50g por planta al voleo.', cultivo: 'Banano', plaga: 'Nutrición' },
    { idProducto: 2, nombre: 'Fungicida Carbendazim', unidadMedida: 'Litro', precio: 12.00, instruccionesAplicacion: 'Diluir 2ml por litro de agua. Fumigar foliar.', cultivo: 'Cacao', plaga: 'Monilia' },
    { idProducto: 3, nombre: 'Herbicida Glifosato', unidadMedida: 'Galón', precio: 22.80, cultivo: 'Cacao', plaga: 'Maleza' },
    { idProducto: 4, nombre: 'Insecticida Imidacloprid', unidadMedida: 'Litro', precio: 18.00, instruccionesAplicacion: 'Aplicar 1ml por litro al follaje.', cultivo: 'Banano', plaga: 'Pulgón' }
  ];

  productosFiltrados = signal<ProductoCatalog[]>(this.todosLosProductos);
  carrito = signal<CartItem[]>([]);

  posForm!: FormGroup;

  // Cálculos Reactivos
  subtotal = computed(() => {
    return this.carrito().reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  });

  costoEnvioReactive = signal<number>(0);

  iva = computed(() => {
    return (this.subtotal() + this.costoEnvioReactive()) * 0.15; // IVA 15% que incluye envío
  });

  granTotal = computed(() => {
    return this.subtotal() + this.costoEnvioReactive() + this.iva();
  });

  ngOnInit() {
    this.inicializarFormulario();
    this.suscribirseAFiltros();
  }

  private inicializarFormulario() {
    this.posForm = this.fb.group({
      idCliente: [null, Validators.required],
      cultivo: [''],
      plaga: [''],
      fechaEntrega: [null, Validators.required],
      ventanaHoraria: [null, Validators.required],
      costoEnvio: [0, [Validators.min(0)]],
      metodoPago: ['EFECTIVO', Validators.required],
      referenciaPago: [''] // Será required dependiendo del método
    });

    // Suscripción a cambios del costo de envío para actualizar el total reactivo
    this.posForm.get('costoEnvio')?.valueChanges.subscribe(val => {
      this.costoEnvioReactive.set(Number(val) || 0);
    });

    // Validadores dinámicos para Referencia de Pago
    this.posForm.get('metodoPago')?.valueChanges.subscribe(metodo => {
      const refControl = this.posForm.get('referenciaPago');
      if (metodo === 'TRANSFERENCIA' || metodo === 'TARJETA') {
        refControl?.setValidators([Validators.required]);
      } else {
        refControl?.clearValidators();
      }
      refControl?.updateValueAndValidity();
    });
  }

  private suscribirseAFiltros() {
    this.posForm.get('cultivo')?.valueChanges.subscribe(() => this.filtrarProductos());
    this.posForm.get('plaga')?.valueChanges.subscribe(() => this.filtrarProductos());
  }

  private filtrarProductos() {
    const cultivo = this.posForm.get('cultivo')?.value?.toLowerCase() || '';
    const plaga = this.posForm.get('plaga')?.value?.toLowerCase() || '';

    let filtrados = this.todosLosProductos;

    if (cultivo) {
      filtrados = filtrados.filter(p => p.cultivo?.toLowerCase() === cultivo);
    }
    if (plaga) {
      filtrados = filtrados.filter(p => p.plaga?.toLowerCase() === plaga);
    }

    this.productosFiltrados.set(filtrados);
  }

  agregarAlCarrito(producto: ProductoCatalog) {
    this.carrito.update(items => {
      const existing = items.find(i => i.producto.idProducto === producto.idProducto);
      if (existing) {
        return items.map(i => i.producto.idProducto === producto.idProducto 
          ? { ...i, cantidad: i.cantidad + 1 } 
          : i);
      }
      return [...items, { producto, cantidad: 1 }];
    });
  }

  incrementar(idProducto: number) {
    this.carrito.update(items =>
      items.map(i => i.producto.idProducto === idProducto 
        ? { ...i, cantidad: i.cantidad + 1 } 
        : i)
    );
  }

  decrementar(idProducto: number) {
    this.carrito.update(items => {
      const existing = items.find(i => i.producto.idProducto === idProducto);
      if (existing && existing.cantidad > 1) {
        return items.map(i => i.producto.idProducto === idProducto 
          ? { ...i, cantidad: i.cantidad - 1 } 
          : i);
      }
      return items.filter(i => i.producto.idProducto !== idProducto);
    });
  }

  confirmarVenta() {
    if (this.posForm.invalid || this.carrito().length === 0) {
      this.toast.error('Validación', 'Complete todos los campos requeridos y agregue productos.');
      this.posForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValues = this.posForm.value;

    const payload = {
      idCliente: formValues.idCliente,
      idTecnico: this.authService.currentUser()?.idUsuario || 1,
      costoEnvio: formValues.costoEnvio,
      metodoPago: formValues.metodoPago,
      referenciaPago: formValues.referenciaPago,
      fechaEstimadaEntrega: formValues.fechaEntrega,
      ventanaHoraria: formValues.ventanaHoraria,
      detalles: this.carrito().map(item => ({
        idProducto: item.producto.idProducto,
        cantidad: item.cantidad
        // No enviamos diagnósticos libres, las instrucciones ya vienen precargadas del master
      }))
    };

    this.http.post(`${environment.apiUrl}/api/operaciones/ventas`, payload)
      .subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.toast.success('Venta Confirmada', 'Venta registrada y notificada a bodega.');
          this.carrito.set([]);
          this.posForm.reset({ metodoPago: 'EFECTIVO', costoEnvio: 0 });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toast.error('Error al confirmar venta', err.error?.message || 'Error de conexión');
        }
      });
  }
}
