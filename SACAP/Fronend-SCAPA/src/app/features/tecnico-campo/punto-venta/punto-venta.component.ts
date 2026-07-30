import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { environment } from '../../../../environments/environment';
import { ProductoService, ProductoDTO } from '../../../core/services/producto.service';
import { ClienteService, ClienteDTO } from '../../../core/services/cliente.service';
import { ComprobanteService, DatosComprobante } from '../../../core/services/comprobante.service';

export interface ProductoCatalog {
  idProducto: number;
  nombre: string;
  unidadMedida: string;
  precio: number;
  instruccionesAplicacion?: string; // We'll map the new agronomic fields here for the UI
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
  private productoService = inject(ProductoService);
  private clienteService = inject(ClienteService);
  private comprobanteService = inject(ComprobanteService);

  isLoading = signal<boolean>(false);

  // Mocks para clientes
  clientes = signal<ClienteCatalog[]>([]);

  todosLosProductos: ProductoCatalog[] = [];

  productosFiltrados = signal<ProductoCatalog[]>([]);
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
    this.cargarClientes();
    this.cargarProductos();
  }

  private cargarClientes() {
    const idTecnico = this.authService.currentUser()?.idUsuario || 1;
    this.clienteService.listarPorTecnico(idTecnico).subscribe({
      next: (clientesDTO) => {
        const catalog = clientesDTO.map(c => ({
          idCliente: c.idCliente,
          nombreFinca: c.nombreFinca || 'Finca (Sin nombre)',
          cedula: c.cedula
        }));
        this.clientes.set(catalog);
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar los clientes')
    });
  }

  private cargarProductos() {
    this.isLoading.set(true);
    this.productoService.listarTodos().subscribe({
      next: (productos) => {
        this.todosLosProductos = productos.map(p => ({
          idProducto: p.idProducto,
          nombre: p.nombre,
          unidadMedida: p.unidadMedida,
          precio: p.precio,
          // Mapeamos los campos agronómicos para la vista
          instruccionesAplicacion: p.ingredienteActivo ? `Ingrediente Activo: ${p.ingredienteActivo}. Carencia: ${p.periodoCarenciaDias || 'N/A'} días.` : p.descripcion,
          cultivo: p.categoria?.nombre, // Usando categoría como cultivo para filtrar temporalmente
          plaga: p.toxicidad?.nombre // Mapeo temporal
        }));
        this.productosFiltrados.set(this.todosLosProductos);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los productos');
        this.isLoading.set(false);
      }
    });
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
          
          // Generar Comprobante PDF
          const clienteEncontrado = this.clientes().find(c => c.idCliente === formValues.idCliente);
          const nombreCliente = clienteEncontrado ? clienteEncontrado.nombreFinca : 'Cliente General';
          
          const datosComprobante: DatosComprobante = {
            titulo: 'Comprobante de Venta - Pre-factura',
            cliente: nombreCliente,
            fecha: new Date().toLocaleDateString(),
            items: this.carrito().map(item => ({
              descripcion: item.producto.nombre,
              cantidad: item.cantidad,
              precioUnitario: item.producto.precio,
              subtotal: item.producto.precio * item.cantidad
            })),
            subtotal: this.subtotal(),
            costoEnvio: this.costoEnvioReactive(),
            iva: this.iva(),
            total: this.granTotal(),
            metodoPago: formValues.metodoPago,
            referencia: formValues.referenciaPago,
            idOperacion: res?.id // Si el backend devuelve el ID de la venta
          };
          
          this.comprobanteService.generarComprobanteVenta(datosComprobante, `comprobante_venta_${Date.now()}.pdf`);

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
