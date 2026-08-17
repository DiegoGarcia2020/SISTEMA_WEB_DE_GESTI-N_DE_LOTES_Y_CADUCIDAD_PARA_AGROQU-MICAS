import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { VentaDTO } from '../models/ventas.model';
import { OrdenCompra } from '../models/compras.model';

/**
 * Paleta compartida con el sistema de diseño "Etiqueta de Almacén"
 * (SACAP/Fronend-SCAPA/src/styles.css). jsPDF no puede leer variables CSS,
 * así que se replican aquí en RGB para que los comprobantes generados
 * coincidan visualmente con el resto de la aplicación.
 */
const BRAND = {
  darkGreen: [18, 38, 29] as [number, number, number],   // --c-dark-green
  midGreen: [47, 93, 69] as [number, number, number],    // --c-mid-green
  cacao: [199, 127, 61] as [number, number, number],     // --c-cacao-accent
  boneBg: [246, 245, 240] as [number, number, number],   // --c-bone-bg
  warmBlack: [26, 26, 22] as [number, number, number],   // --c-warm-black
  sage: [143, 174, 155] as [number, number, number],     // --c-sage-border
  success: [61, 122, 88] as [number, number, number],    // --c-success
  error: [185, 62, 62] as [number, number, number],      // --c-error
};

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

  constructor() { }

  /** Dibuja la cabecera de marca compartida por ambos comprobantes. */
  private dibujarCabecera(doc: jsPDF, subtitulo: string): void {
    doc.setFillColor(...BRAND.darkGreen);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFillColor(...BRAND.cacao);
    doc.rect(0, 40, 210, 1.5, 'F');

    doc.setTextColor(...BRAND.boneBg);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AGROQUÍMICOS SACPA', 15, 20);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitulo, 15, 30);
  }

  /** Dibuja el pie de página compartido. */
  private dibujarPie(doc: jsPDF, mensaje: string): void {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.sage);
    doc.text(mensaje, 105, 280, { align: 'center' });
  }

  generarComprobanteVenta(venta: VentaDTO, nombreArchivo: string = `Comprobante_Venta_${venta.numeroOrden || venta.idVenta}.pdf`) {
    const doc = new jsPDF();

    this.dibujarCabecera(doc, 'Comprobante de Venta');

    doc.setTextColor(...BRAND.warmBlack);
    doc.setFontSize(11);
    
    doc.text(`Cliente: ${venta.nombreCliente}`, 15, 55);
    const fechaText = venta.fechaVenta ? new Date(venta.fechaVenta).toLocaleString() : new Date().toLocaleString();
    doc.text(`Fecha: ${fechaText}`, 15, 62);
    
    doc.text(`N° Operación: ${venta.numeroOrden || venta.idVenta}`, 130, 55);
    doc.text(`Técnico: ${venta.nombreTecnico}`, 130, 62);
    doc.text(`Estado: ${venta.estado}`, 130, 69);
    
    // Tabla de Detalles
    const tableColumn = ["Descripción", "Lote", "Cantidad", "Precio U.", "Subtotal"];
    const tableRows: string[][] = [];
    
    if (venta.lineas && venta.lineas.length > 0) {
      venta.lineas.forEach(l => {
        const itemData = [
          l.nombreProducto + (l.esComboIA ? ' (Combo IA)' : ''),
          l.numeroLote,
          l.cantidad.toString(),
          `$${l.precioUnitario.toFixed(2)}`,
          `$${l.subtotalLinea.toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
    }
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: BRAND.midGreen, textColor: BRAND.boneBg },
      styles: { fontSize: 10, cellPadding: 3, textColor: BRAND.warmBlack },
      alternateRowStyles: { fillColor: BRAND.boneBg }
    });
    
    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 130, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 130, finalY + 7);
    doc.text(`$${venta.subtotal.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
    
    let currentY = finalY + 14;
    if (venta.descuentoTotal > 0) {
      doc.text(`Descuento:`, 130, currentY);
      doc.text(`-$${venta.descuentoTotal.toFixed(2)}`, 180, currentY, { align: 'right' });
      currentY += 7;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.darkGreen);
    doc.text(`TOTAL:`, 130, currentY + 9);
    doc.text(`$${venta.total.toFixed(2)}`, 180, currentY + 9, { align: 'right' });
    
    this.dibujarPie(doc, '¡Gracias por su compra!');
    
    doc.save(nombreArchivo);
  }

  generarComprobanteCompra(orden: OrdenCompra, nombreArchivo: string = `Orden_Compra_OC${orden.id}.pdf`) {
    const doc = new jsPDF();

    this.dibujarCabecera(doc, 'Orden de Compra');

    doc.setTextColor(...BRAND.warmBlack);
    doc.setFontSize(11);
    
    doc.text(`Proveedor: ${orden.nombreProveedor}`, 15, 55);
    doc.text(`N° Factura: ${orden.numeroFactura}`, 15, 62);
    doc.text(`Fecha Emisión: ${orden.fechaEmision}`, 15, 69);
    
    doc.text(`N° Orden: OC-${orden.id}`, 130, 55);
    doc.text(`Estado: ${orden.estado}`, 130, 62);
    
    const tableColumn = ["Producto", "UM", "Cant.", "Precio U.", "Desc.", "Subtotal"];
    const tableRows: string[][] = [];
    
    if (orden.detalles && orden.detalles.length > 0) {
      orden.detalles.forEach(d => {
        const itemData = [
          d.nombreProducto + (d.esBonificacion ? ' (Bonif.)' : ''),
          d.unidadMedida,
          d.cantidad.toString(),
          `$${d.precioUnitario.toFixed(2)}`,
          `${d.porcentajeDescuento}%`,
          `$${d.subtotal.toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
    }
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: BRAND.midGreen, textColor: BRAND.boneBg },
      styles: { fontSize: 10, cellPadding: 3, textColor: BRAND.warmBlack },
      alternateRowStyles: { fillColor: BRAND.boneBg }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 130, finalY);
    
    doc.setFont('helvetica', 'normal');
    let offsetY = finalY + 7;
    doc.text(`Subtotal Bruto:`, 130, offsetY);
    doc.text(`$${orden.subtotalBruto.toFixed(2)}`, 180, offsetY, { align: 'right' });
    
    offsetY += 7;
    doc.text(`Descuentos:`, 130, offsetY);
    doc.text(`-$${orden.totalDescuentos.toFixed(2)}`, 180, offsetY, { align: 'right' });
    
    offsetY += 7;
    doc.text(`Transporte:`, 130, offsetY);
    doc.text(`$${orden.costoTransporte.toFixed(2)}`, 180, offsetY, { align: 'right' });
    
    offsetY += 7;
    doc.text(`Impuestos:`, 130, offsetY);
    doc.text(`$${orden.impuestos.toFixed(2)}`, 180, offsetY, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.darkGreen);
    offsetY += 9;
    doc.text(`TOTAL NETO:`, 130, offsetY);
    doc.text(`$${orden.totalNeto.toFixed(2)}`, 180, offsetY, { align: 'right' });
    
    this.dibujarPie(doc, 'Uso interno administrativo');
    
    doc.save(nombreArchivo);
  }

  generarNotaDevolucion(devolucion: any, nombreArchivo: string = `Nota_Devolucion_DEV${devolucion.id || devolucion.idVenta}.pdf`) {
    const doc = new jsPDF();

    this.dibujarCabecera(doc, 'Nota de Devolución');

    doc.setTextColor(...BRAND.warmBlack);
    doc.setFontSize(11);
    
    doc.text(`Cliente: ${devolucion.nombreCliente}`, 15, 55);
    const fechaSolicitud = devolucion.fechaSolicitud ? new Date(devolucion.fechaSolicitud).toLocaleString() : new Date().toLocaleString();
    doc.text(`Fecha Solicitud: ${fechaSolicitud}`, 15, 62);
    if (devolucion.fechaRecepcion) {
      doc.text(`Fecha Recepción: ${new Date(devolucion.fechaRecepcion).toLocaleString()}`, 15, 69);
    }
    
    doc.text(`N° Operación (Origen): ${devolucion.numeroComprobante || devolucion.idVenta}`, 120, 55);
    doc.text(`Técnico: ${devolucion.nombreTecnico}`, 120, 62);
    
    const tableColumn = ["Producto", "Cantidad", "Motivo", "Estado Logístico", "Inventario"];
    const tableRows: string[][] = [];
    
    tableRows.push([
      devolucion.nombreProducto,
      devolucion.cantidadDevuelta.toString(),
      devolucion.motivo || 'N/A',
      devolucion.estadoLogistico,
      devolucion.estadoInventario || 'PENDIENTE'
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: BRAND.midGreen, textColor: BRAND.boneBg },
      styles: { fontSize: 10, cellPadding: 3, textColor: BRAND.warmBlack },
      alternateRowStyles: { fillColor: BRAND.boneBg },
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index === 4) {
          const text = data.cell.raw;
          if (text === 'DISPONIBLE') {
            data.cell.styles.textColor = BRAND.success;
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'CUARENTENA') {
            data.cell.styles.textColor = BRAND.cacao;
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'DESECHADO') {
            data.cell.styles.textColor = BRAND.error;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    this.dibujarPie(doc, 'Documento sin validez tributaria');
    
    doc.save(nombreArchivo);
  }
}
