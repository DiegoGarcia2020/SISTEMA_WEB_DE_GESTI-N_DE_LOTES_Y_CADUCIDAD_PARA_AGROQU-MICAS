package org.uteq.sacpa.service.ia_externa;

import java.util.List;

/** Cliente de la API de Gemini — solo redacta texto, nunca decide reglas de negocio. */
public interface IGeminiIAService {

    /**
     * Redacta un texto por cada prompt de la lista, EN UNA SOLA llamada a la API (el free tier
     * de Gemini permite pocas solicitudes por día, así que no se puede llamar una vez por ítem).
     * Devuelve la lista en el mismo orden y tamaño que {@code prompts}.
     * Lanza excepción si la key no está configurada o la llamada falla; el caller decide el fallback.
     */
    List<String> generarJustificaciones(List<String> prompts);
}
