package org.uteq.sacpa.service.reportes;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xddf.usermodel.chart.AxisPosition;
import org.apache.poi.xddf.usermodel.chart.BarDirection;
import org.apache.poi.xddf.usermodel.chart.ChartTypes;
import org.apache.poi.xddf.usermodel.chart.LegendPosition;
import org.apache.poi.xddf.usermodel.chart.XDDFBarChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFCategoryAxis;
import org.apache.poi.xddf.usermodel.chart.XDDFChartData;
import org.apache.poi.xddf.usermodel.chart.XDDFChartLegend;
import org.apache.poi.xddf.usermodel.chart.XDDFDataSourcesFactory;
import org.apache.poi.xddf.usermodel.chart.XDDFValueAxis;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFDrawing;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.ventas.VentaRankingDTO;
import org.uteq.sacpa.dto.ventas.VentasMasVendidosDTO;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Genera los reportes exportables de "Productos más vendidos" (Pregunta #1):
 * Excel (.xlsx) con grafico embebido, PDF con barras y CSV con separador ';'.
 */
@Service
public class ReporteVentasService {

    private static final Color VERDE = new Color(11, 70, 40);

    private final DecimalFormat moneda;
    private final DecimalFormat numeroDecimal;

    public ReporteVentasService() {
        DecimalFormatSymbols simbolos = new DecimalFormatSymbols(Locale.forLanguageTag("es-EC"));
        this.moneda = new DecimalFormat("\u00A4#,##0.00", simbolos);
        this.numeroDecimal = new DecimalFormat("0.0", simbolos);
    }

    // ============================= EXCEL =============================

    public byte[] excel(VentasMasVendidosDTO data) {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = wb.createSheet("Productos Más Vendidos");
            List<VentaRankingDTO> ranking = data.getRanking();

            XSSFCellStyle tituloStyle = wb.createCellStyle();
            tituloStyle.setFont(fuente(wb, 16, IndexedColors.WHITE.getIndex()));
            tituloStyle.setFillForegroundColor(new XSSFColor(VERDE, new DefaultIndexedColorMap()));
            tituloStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            tituloStyle.setAlignment(HorizontalAlignment.CENTER);
            tituloStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            XSSFCellStyle textoStyle = wb.createCellStyle();
            textoStyle.setAlignment(HorizontalAlignment.LEFT);

            XSSFRow r0 = sheet.createRow(0);
            r0.setHeightInPoints(28);
            XSSFCell c0 = r0.createCell(0);
            c0.setCellValue("PRODUCTOS MÁS VENDIDOS");
            c0.setCellStyle(tituloStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            XSSFRow r1 = sheet.createRow(1);
            XSSFCell c1 = r1.createCell(0);
            c1.setCellValue(etiquetaPeriodo(data));
            c1.setCellStyle(textoStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 5));

            XSSFRow r2 = sheet.createRow(2);
            XSSFCell c2 = r2.createCell(0);
            c2.setCellValue("Fecha de generación: " + fechaActual());
            c2.setCellStyle(textoStyle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 5));

            int filaEncabezado = 4;
            String[] columnas = {"Ranking", "Producto", "Unidades vendidas", "Monto total", "Período anterior", "Variación %"};
            XSSFCellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFont(fuente(wb, 11, IndexedColors.WHITE.getIndex()));
            headerStyle.setFillForegroundColor(new XSSFColor(VERDE, new DefaultIndexedColorMap()));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            XSSFRow header = sheet.createRow(filaEncabezado);
            header.setHeightInPoints(22);
            for (int i = 0; i < columnas.length; i++) {
                XSSFCell hc = header.createCell(i);
                hc.setCellValue(columnas[i]);
                hc.setCellStyle(headerStyle);
            }

            XSSFCellStyle numeroStyle = estiloNumero(wb, "#,##0");
            XSSFCellStyle monedaStyle = estiloNumero(wb, "$#,##0.00");
            XSSFCellStyle varPosStyle = estiloVariacion(wb, new XSSFColor(new Color(0, 128, 0), new DefaultIndexedColorMap()));
            XSSFCellStyle varNegStyle = estiloVariacion(wb, new XSSFColor(new Color(192, 0, 0), new DefaultIndexedColorMap()));
            XSSFCellStyle varNuevoStyle = estiloVariacion(wb, new XSSFColor(new Color(128, 128, 128), new DefaultIndexedColorMap()));

            int i = 0;
            for (VentaRankingDTO r : ranking) {
                int fila = filaEncabezado + 1 + i;
                XSSFRow dr = sheet.createRow(fila);

                XSSFCell rank = dr.createCell(0);
                rank.setCellValue(i + 1);
                rank.setCellStyle(estiloCentro(wb));

                dr.createCell(1).setCellValue(r.getNombre());

                XSSFCell unidades = dr.createCell(2);
                unidades.setCellValue(r.getUnidades());
                unidades.setCellStyle(numeroStyle);

                XSSFCell monto = dr.createCell(3);
                monto.setCellValue(r.getMontoTotal() == null ? 0 : r.getMontoTotal().doubleValue());
                monto.setCellStyle(monedaStyle);

                XSSFCell anterior = dr.createCell(4);
                if (r.getUnidadesAnterior() != null) {
                    anterior.setCellValue(r.getUnidadesAnterior());
                    anterior.setCellStyle(numeroStyle);
                }

                XSSFCell variacion = dr.createCell(5);
                if (r.getVariacion() == null) {
                    variacion.setCellValue("Nuevo");
                    variacion.setCellStyle(varNuevoStyle);
                } else {
                    variacion.setCellValue(r.getVariacion() / 100.0);
                    variacion.setCellStyle(r.getVariacion() >= 0 ? varPosStyle : varNegStyle);
                }
                i++;
            }

            int ultimaFila = filaEncabezado + i;
            if (!ranking.isEmpty()) {
                XSSFRow total = sheet.createRow(ultimaFila + 1);
                XSSFCell t1 = total.createCell(0);
                t1.setCellValue("TOTALES");
                t1.setCellStyle(estiloTotal(wb, HorizontalAlignment.LEFT));
                total.createCell(1).setCellStyle(estiloTotal(wb, HorizontalAlignment.LEFT));
                XSSFCell tu = total.createCell(2);
                tu.setCellValue(ranking.stream().mapToLong(VentaRankingDTO::getUnidades).sum());
                tu.setCellStyle(estiloTotal(wb, HorizontalAlignment.RIGHT));
                XSSFCell tm = total.createCell(3);
                tm.setCellValue(ranking.stream().map(r -> r.getMontoTotal() == null ? BigDecimal.ZERO : r.getMontoTotal())
                        .reduce(BigDecimal.ZERO, BigDecimal::add).doubleValue());
                tm.setCellStyle(estiloTotal(wb, HorizontalAlignment.RIGHT));
                total.createCell(4).setCellStyle(estiloTotal(wb, HorizontalAlignment.RIGHT));
                total.createCell(5).setCellStyle(estiloTotal(wb, HorizontalAlignment.RIGHT));
            }

            sheet.setColumnWidth(0, 9 * 256);
            sheet.setColumnWidth(1, 42 * 256);
            sheet.setColumnWidth(2, 18 * 256);
            sheet.setColumnWidth(3, 16 * 256);
            sheet.setColumnWidth(4, 18 * 256);
            sheet.setColumnWidth(5, 14 * 256);
            sheet.createFreezePane(0, filaEncabezado + 1);
            sheet.setAutoFilter(new CellRangeAddress(filaEncabezado, Math.max(filaEncabezado, ultimaFila), 0, 5));

            if (!ranking.isEmpty()) {
                crearGrafico(sheet, filaEncabezado, ranking.size());
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar el reporte Excel", e);
        }
    }

    private void crearGrafico(XSSFSheet sheet, int filaEncabezado, int n) {
        XSSFDrawing drawing = sheet.createDrawingPatriarch();
        int primeraFila = filaEncabezado + 1;
        int ultimaFila = filaEncabezado + n;

        XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, 1, ultimaFila + 3, 8, ultimaFila + 22);
        XSSFChart chart = drawing.createChart(anchor);
        chart.setTitleText("Unidades vendidas por producto");
        chart.setTitleOverlay(false);

        XDDFChartLegend legend = chart.getOrAddLegend();
        legend.setPosition(LegendPosition.BOTTOM);

        XDDFCategoryAxis categoryAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
        XDDFValueAxis valueAxis = chart.createValueAxis(AxisPosition.LEFT);

        XDDFChartData data = chart.createData(ChartTypes.BAR, categoryAxis, valueAxis);
        if (data instanceof XDDFBarChartData bar) {
            bar.setBarDirection(BarDirection.COL);
            XDDFBarChartData.Series series = (XDDFBarChartData.Series) bar.addSeries(
                    XDDFDataSourcesFactory.fromStringCellRange(sheet, new CellRangeAddress(primeraFila, ultimaFila, 1, 1)),
                    XDDFDataSourcesFactory.fromNumericCellRange(sheet, new CellRangeAddress(primeraFila, ultimaFila, 2, 2)));
            series.setTitle("Unidades vendidas", null);
        }
        chart.plot(data);
    }

    // ============================= PDF =============================

    public byte[] pdf(VentasMasVendidosDTO data) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            Font titulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(11, 70, 40));
            Paragraph p1 = new Paragraph("PRODUCTOS MÁS VENDIDOS", titulo);
            p1.setAlignment(Element.ALIGN_CENTER);
            doc.add(p1);

            Font sub = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(120, 120, 120));
            Paragraph p2 = new Paragraph(etiquetaPeriodo(data) + "   |   Fecha de generación: " + fechaActual(), sub);
            p2.setAlignment(Element.ALIGN_CENTER);
            doc.add(p2);
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 4.5f, 2.0f, 2.2f, 2.0f, 2.0f});
            Color verde = new Color(11, 70, 40);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] columnas = {"Ranking", "Producto", "Unidades vendidas", "Monto total", "Período anterior", "Variación %"};
            for (String col : columnas) {
                PdfPCell hc = new PdfPCell(new Phrase(col, headerFont));
                hc.setBackgroundColor(verde);
                hc.setHorizontalAlignment(Element.ALIGN_CENTER);
                hc.setVerticalAlignment(Element.ALIGN_MIDDLE);
                hc.setPadding(6);
                table.addCell(hc);
            }

            int i = 1;
            for (VentaRankingDTO r : data.getRanking()) {
                table.addCell(celdaCentrada(String.valueOf(i)));
                table.addCell(new PdfPCell(new Phrase(r.getNombre())));
                table.addCell(celdaCentrada(String.valueOf(r.getUnidades())));
                table.addCell(celdaCentrada(moneda(r.getMontoTotal())));
                table.addCell(celdaCentrada(r.getUnidadesAnterior() == null ? "" : String.valueOf(r.getUnidadesAnterior())));
                table.addCell(celdaVariacion(r.getVariacion()));
                i++;
            }

            doc.add(table);
            doc.add(Chunk.NEWLINE);

            if (!data.getRanking().isEmpty()) {
                float yInicio = Math.max(120, writer.getVerticalPosition(true) - 10);
                dibujarBarras(writer.getDirectContent(), data.getRanking(), doc.getPageSize(), yInicio);
            }

            doc.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new IllegalStateException("No se pudo generar el reporte PDF", e);
        }
    }

    private void dibujarBarras(PdfContentByte cb, List<VentaRankingDTO> ranking, Rectangle page, float yInicio) {
        int limite = Math.min(ranking.size(), 15);
        long max = ranking.stream().mapToLong(VentaRankingDTO::getUnidades).max().orElse(1);

        Color verde = new Color(11, 70, 40);
        Font label = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);
        Font valor = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.BLACK);

        float xInicio = 60;
        float anchoDisponible = page.getWidth() - xInicio - 60;
        float alturaFila = 14;
        float y = yInicio;
        float columnaTexto = 180;
        float textoY = yInicio - 12;

        ColumnText ct = new ColumnText(cb);
        ct.setSimpleColumn(xInicio, textoY, columnaTexto, textoY + limite * alturaFila + 4);

        for (int i = 0; i < limite; i++) {
            VentaRankingDTO r = ranking.get(i);
            String nombre = (i + 1) + ". " + r.getNombre();
            if (nombre.length() > 30) nombre = nombre.substring(0, 30) + "...";
            ct.addElement(new Paragraph(nombre, label));
        }
        ct.go();

        for (int i = 0; i < limite; i++) {
            VentaRankingDTO r = ranking.get(i);
            float anchoBarra = (float) (r.getUnidades() * anchoDisponible / (max * 1.0));
            cb.setColorFill(verde);
            cb.roundRectangle(xInicio + columnaTexto - xInicio, y, Math.max(2, anchoBarra), alturaFila - 6, 3);
            cb.fill();

            Font fv = valor;
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase(String.valueOf(r.getUnidades()), fv),
                    xInicio + columnaTexto - xInicio + Math.max(2, anchoBarra) + 4,
                    y + (alturaFila - 6) / 2 - 3, 0);
            y -= alturaFila;
        }
    }

    // ============================= CSV =============================

    public byte[] csv(VentasMasVendidosDTO data) {
        StringBuilder sb = new StringBuilder("\uFEFF");
        sb.append("Ranking;Producto;Unidades vendidas;Monto total;Per\u00EDodo anterior;Variaci\u00F3n %\r\n");
        int i = 1;
        for (VentaRankingDTO r : data.getRanking()) {
            sb.append(i).append(';')
                    .append(comillas(r.getNombre())).append(';')
                    .append(r.getUnidades()).append(';')
                    .append(moneda(r.getMontoTotal())).append(';')
                    .append(r.getUnidadesAnterior() == null ? "" : r.getUnidadesAnterior()).append(';')
                    .append(variacionTexto(r.getVariacion())).append("\r\n");
            i++;
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // ============================= HELPERS =============================

    private XSSFFont fuente(XSSFWorkbook wb, int puntos, short color) {
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(color);
        f.setFontHeightInPoints((short) puntos);
        return f;
    }

    private XSSFCellStyle estiloCentro(XSSFWorkbook wb) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setAlignment(HorizontalAlignment.CENTER);
        s.setVerticalAlignment(VerticalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle estiloNumero(XSSFWorkbook wb, String formato) {
        XSSFCellStyle s = wb.createCellStyle();
        s.setDataFormat(wb.createDataFormat().getFormat(formato));
        s.setAlignment(HorizontalAlignment.RIGHT);
        return s;
    }

    private XSSFCellStyle estiloVariacion(XSSFWorkbook wb, XSSFColor color) {
        XSSFFont f = wb.createFont();
        f.setBold(true);
        f.setColor(color);
        XSSFCellStyle s = wb.createCellStyle();
        s.setFont(f);
        s.setDataFormat(wb.createDataFormat().getFormat("+0.0%;-0.0%;0.0%"));
        s.setAlignment(HorizontalAlignment.CENTER);
        return s;
    }

    private XSSFCellStyle estiloTotal(XSSFWorkbook wb, HorizontalAlignment alinear) {
        XSSFFont f = wb.createFont();
        f.setBold(true);
        XSSFCellStyle s = wb.createCellStyle();
        s.setFont(f);
        s.setFillForegroundColor(new XSSFColor(new Color(235, 240, 235), new DefaultIndexedColorMap()));
        s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        s.setAlignment(alinear);
        return s;
    }

    private PdfPCell celdaCentrada(String texto) {
        PdfPCell c = new PdfPCell(new Phrase(texto == null ? "" : texto));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setPadding(4);
        return c;
    }

    private PdfPCell celdaVariacion(Double variacion) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA, 10);
        String texto;
        if (variacion == null) {
            texto = "Nuevo";
            f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.GRAY);
        } else if (variacion >= 0) {
            texto = "+" + numeroDecimal.format(variacion) + "%";
            f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.GREEN);
        } else {
            texto = numeroDecimal.format(variacion) + "%";
            f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.RED);
        }
        PdfPCell c = new PdfPCell(new Phrase(texto, f));
        c.setHorizontalAlignment(Element.ALIGN_CENTER);
        c.setVerticalAlignment(Element.ALIGN_MIDDLE);
        c.setPadding(4);
        return c;
    }

    private String etiquetaPeriodo(VentasMasVendidosDTO d) {
        String label = switch (d.getPeriodo() == null ? "ESTA_SEMANA" : d.getPeriodo().toUpperCase()) {
            case "ESTA_SEMANA" -> "Esta semana";
            case "SEMANA_ANTERIOR" -> "Semana anterior";
            case "ESTE_MES" -> "Este mes";
            case "MES_ANTERIOR" -> "Mes anterior";
            case "ULTIMOS_30_DIAS" -> "Últimos 30 días";
            case "PERSONALIZADO" -> "Período personalizado";
            case "QUINCENA" -> "Últimos 15 días";
            case "MES" -> "Último mes";
            default -> "Semana actual";
        };
        return label + ": " + fecha(d.getDesde()) + " \u2013 " + fecha(d.getHasta());
    }

    private String fecha(LocalDateTime fechaHora) {
        return fechaHora == null ? "" : DateTimeFormatter.ofPattern("dd/MM/yyyy").format(fechaHora);
    }

    private String fechaActual() {
        return DateTimeFormatter.ofPattern("dd/MM/yyyy").format(LocalDate.now());
    }

    private String moneda(BigDecimal valor) {
        return moneda.format(valor == null ? BigDecimal.ZERO : valor);
    }

    private String variacionTexto(Double variacion) {
        if (variacion == null) return "Nuevo";
        String signo = variacion >= 0 ? "+" : "";
        return signo + numeroDecimal.format(variacion) + "%";
    }

    private String comillas(String texto) {
        String limpio = texto == null ? "" : texto;
        return "\"" + limpio.replace("\"", "\"\"") + "\"";
    }
}
