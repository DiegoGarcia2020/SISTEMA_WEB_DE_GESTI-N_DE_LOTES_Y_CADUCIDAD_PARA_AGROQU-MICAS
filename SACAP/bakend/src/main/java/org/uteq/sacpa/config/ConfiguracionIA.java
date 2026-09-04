package org.uteq.sacpa.config;

import org.springframework.stereotype.Component;

/**
 * Guarda cuál proveedor de IA externa (GEMINI, GROQ, ...) está activo para redactar las
 * justificaciones del Motor de Sugerencias. Lo actualiza {@code ConfiguracionController}
 * cuando el admin cambia el selector en Configuración General; lo lee
 * {@link org.uteq.sacpa.service.ia_externa.ProveedorIAFactory} antes de cada llamada.
 * Vive solo en memoria (mismo criterio que el resto de "Configuración Global" del sistema).
 */
@Component
public class ConfiguracionIA {

    private volatile String proveedorActivo = "GEMINI";

    public String getProveedorActivo() {
        return proveedorActivo;
    }

    public void setProveedorActivo(String proveedorActivo) {
        if (proveedorActivo != null && !proveedorActivo.isBlank()) {
            this.proveedorActivo = proveedorActivo.toUpperCase();
        }
    }
}
