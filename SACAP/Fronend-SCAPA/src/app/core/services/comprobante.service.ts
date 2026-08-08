import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { VentaDTO } from '../models/ventas.model';
import { OrdenCompra } from '../models/compras.model';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

  constructor() { }

  generarComprobanteVenta(venta: VentaDTO, nombreArchivo: string = `Comprobante_Venta_${venta.numeroOrden || venta.idVenta}.pdf`) {
    const doc = new jsPDF();
    
    // Configuración de colores y fuentes
    const primaryColor = [21, 128, 61]; // bg-green-700
    const textColor = [51, 51, 51];
    
    // Cabecera
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AGROQUÍMICOS SACPA', 15, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Venta', 15, 30);
    
    // Información del Cliente y Factura
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
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
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen:', 130, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 130, finalY + 7);
    doc.text(`$${venta.subtotal.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
    
    if (venta.descuentoTotal > 0) {
      doc.text(`Descuento:`, 130, finalY + 14);
      doc.text(`-$${venta.descuentoTotal.toFixed(2)}`, 180, finalY + 14, { align: 'right' });
    }
    
    // Asumimos IVA 0 por ahora o podemos calcular si estuviera en DTO
    const currentY = venta.descuentoTotal > 0 ? finalY + 21 : finalY + 14;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL:`, 130, currentY + 9);
    doc.text(`$${venta.total.toFixed(2)}`, 180, currentY + 9, { align: 'right' });
    
    // Pie de página
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('¡Gracias por su compra!', 105, 280, { align: 'center' });
    
    doc.save(nombreArchivo);
  }

  generarComprobanteCompra(orden: OrdenCompra, nombreArchivo: string = `Orden_Compra_OC${orden.id}.pdf`) {
    const doc = new jsPDF();
    const primaryColor = [15, 23, 42]; // dark slate para compras
    const textColor = [51, 51, 51];
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AGROQUÍMICOS SACPA', 15, 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Orden de Compra', 15, 30);
    
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
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
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
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
    offsetY += 9;
    doc.text(`TOTAL NETO:`, 130, offsetY);
    doc.text(`$${orden.totalNeto.toFixed(2)}`, 180, offsetY, { align: 'right' });
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Uso interno Administrativo', 105, 280, { align: 'center' });
    
    doc.save(nombreArchivo);
  }
}
