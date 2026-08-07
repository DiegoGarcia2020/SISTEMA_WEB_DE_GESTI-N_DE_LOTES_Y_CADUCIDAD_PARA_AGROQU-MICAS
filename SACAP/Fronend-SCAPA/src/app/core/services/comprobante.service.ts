import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface DatosComprobante {
  titulo: string;
  cliente: string;
  fecha: string;
  items: { descripcion: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  subtotal: number;
  costoEnvio: number;
  iva: number;
  total: number;
  metodoPago?: string;
  referencia?: string;
  idOperacion?: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class ComprobanteService {

  constructor() { }

  generarComprobanteVenta(datos: DatosComprobante, nombreArchivo: string = 'comprobante_venta.pdf') {
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
    doc.text(datos.titulo, 15, 30);
    
    // Información del Cliente y Factura
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(11);
    
    doc.text(`Cliente: ${datos.cliente}`, 15, 55);
    doc.text(`Fecha: ${datos.fecha}`, 15, 62);
    if (datos.idOperacion) {
      doc.text(`N° Operación: ${datos.idOperacion}`, 130, 55);
    }
    if (datos.metodoPago) {
      doc.text(`Método de Pago: ${datos.metodoPago}`, 130, 62);
    }
    if (datos.referencia) {
      doc.text(`Referencia: ${datos.referencia}`, 130, 69);
    }
    
    // Tabla de Detalles
    const tableColumn = ["Descripción", "Cantidad", "Precio Unitario", "Subtotal"];
    const tableRows: string[][] = [];
    
    datos.items.forEach(item => {
      const itemData = [
        item.descripcion,
        item.cantidad.toString(),
        `$${item.precioUnitario.toFixed(2)}`,
        `$${item.subtotal.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });
    
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
    doc.text(`$${datos.subtotal.toFixed(2)}`, 180, finalY + 7, { align: 'right' });
    
    doc.text(`Costo de Envío:`, 130, finalY + 14);
    doc.text(`$${datos.costoEnvio.toFixed(2)}`, 180, finalY + 14, { align: 'right' });
    
    doc.text(`IVA (15%):`, 130, finalY + 21);
    doc.text(`$${datos.iva.toFixed(2)}`, 180, finalY + 21, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL:`, 130, finalY + 30);
    doc.text(`$${datos.total.toFixed(2)}`, 180, finalY + 30, { align: 'right' });
    
    // Pie de página
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('¡Gracias por su compra!', 105, 280, { align: 'center' });
    
    // Guardar el documento
    doc.save(nombreArchivo);
  }
}
