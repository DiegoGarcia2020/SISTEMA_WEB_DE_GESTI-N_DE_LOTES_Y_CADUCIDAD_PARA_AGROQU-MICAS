package org.uteq.sacpa.service.ia_externa;

import java.util.List;

/**
 * Cliente de un proveedor externo de IA — solo redacta texto, nunca decide reglas de negocio.
 * Implementaciones: {@code GeminiIAServiceImpl} (bean "GEMINI"), {@code GroqIAServiceImpl} (bean "GROQ").
 * Cuál se usa en cada momento lo decide {@link ProveedorIAFactory} según la configuración del admin.
 */
public interface IProveedorIAService {

    /**
     * Redacta un texto por cada prompt de la lista, EN UNA SOLA llamada a la API (los tiers
     * gratuitos permiten pocas solicitudes por día, así que no se puede llamar una vez por ítem).
     * Devuelve la lista en el mismo orden y tamaño que {@code prompts}.
     * Lanza excepción si la key no está configurada o la llamada falla; el caller decide el fallback.
     */
    List<String> generarJustificaciones(List<String> prompts);
}
