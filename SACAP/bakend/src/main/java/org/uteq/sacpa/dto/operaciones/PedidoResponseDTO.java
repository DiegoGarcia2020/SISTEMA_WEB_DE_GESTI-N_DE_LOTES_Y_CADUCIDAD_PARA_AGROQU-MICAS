package org.uteq.sacpa.dto.operaciones;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.uteq.sacpa.entity.operaciones.UsoCampo;

import java.time.LocalDate;

/**
 * Vista plana de una Orden de Pedido (operaciones.uso_campo con tipo_registro = 'ORDEN_PEDIDO')
 * para el historial del Técnico y la cola de despachos del Bodeguero. Evita devolver la entidad
 * JPA cruda: UsoCampo.lote/cliente/tecnico son LAZY y open-in-view=false rompe con
 * LazyInitializationException al serializar fuera de la transacción.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PedidoResponseDTO {
    private Integer idUso;
    private LocalDate fechaAplicacion;
    private String descripcionPlaga;
    private String observacion;
    private Integer cantidadUsada;
    private Integer cantidadReservada;
    private Integer idEstadoPedido;
    private Integer idComboAplicado;
    private Integer idLote;
    private ClienteResumen cliente;
    private LoteResumen lote;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ClienteResumen {
        private String nombreFinca;
        private String cedula;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoteResumen {
        private String numeroLote;
        private String nombreProducto;
        private String ubicacionAlmacen;
    }

    public static PedidoResponseDTO from(UsoCampo u) {
        return PedidoResponseDTO.builder()
                .idUso(u.getIdUso())
                .fechaAplicacion(u.getFechaAplicacion())
                .descripcionPlaga(u.getDescripcionPlaga())
                .observacion(u.getObservacion())
                .cantidadUsada(u.getCantidadUsada())
                .cantidadReservada(u.getCantidadReservada())
                .idEstadoPedido(u.getIdEstadoPedido())
                .idComboAplicado(u.getIdComboAplicado())
                .idLote(u.getLote() != null ? u.getLote().getIdLote() : null)
                .cliente(u.getCliente() != null ? ClienteResumen.builder()
                        .nombreFinca(u.getCliente().getNombreFinca())
                        .cedula(u.getCliente().getCedula())
                        .build() : null)
                .lote(u.getLote() != null ? LoteResumen.builder()
                        .numeroLote(u.getLote().getNumeroLote())
                        .nombreProducto(u.getLote().getProducto() != null ? u.getLote().getProducto().getNombre() : null)
                        .ubicacionAlmacen(u.getLote().getAlmacen() != null ? u.getLote().getAlmacen().getNombre() : null)
                        .build() : null)
                .build();
    }
}
