package org.uteq.sacpa.service.ia_externa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.uteq.sacpa.config.ConfiguracionIA;

import java.util.Map;

/**
 * Decide, en cada llamada, qué implementación de {@link IProveedorIAService} usar
 * (GEMINI, GROQ, ...) según lo que haya elegido el admin en Configuración General.
 * Spring inyecta automáticamente todos los beans de ese tipo en el Map, indexados
 * por el nombre que cada uno declara en su @Service("NOMBRE").
 */
@Component
@RequiredArgsConstructor
public class ProveedorIAFactory {

    private static final String PROVEEDOR_DEFECTO = "GEMINI";

    private final Map<String, IProveedorIAService> proveedores;
    private final ConfiguracionIA configuracionIA;

    public IProveedorIAService obtenerActivo() {
        IProveedorIAService proveedor = proveedores.get(configuracionIA.getProveedorActivo());
        return proveedor != null ? proveedor : proveedores.get(PROVEEDOR_DEFECTO);
    }
}
