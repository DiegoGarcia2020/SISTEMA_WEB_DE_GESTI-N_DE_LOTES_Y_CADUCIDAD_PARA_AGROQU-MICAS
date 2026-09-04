package org.uteq.sacpa.service.ia_externa.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.uteq.sacpa.service.ia_externa.IProveedorIAService;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Llama a la API gratuita de Groq (console.groq.com, compatible con el formato de OpenAI)
 * solo para redactar el texto de las justificaciones del Motor de Sugerencias. El score,
 * el descuento y las reglas de negocio (stock, vencimiento) los sigue calculando
 * MotorSugerenciaIAServiceImpl de forma determinística — esta clase nunca decide qué ni
 * cuánto vender.
 */
@Service("GROQ")
public class GroqIAServiceImpl implements IProveedorIAService {

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:qwen/qwen3.6-27b}")
    private String modelo;

    /** Los modelos "reasoning" de Groq gastan tokens pensando antes de responder; sin este
     * tope explícito, con muchos ítems la respuesta se corta antes de cerrar el JSON. */
    private static final int MAX_TOKENS = 8000;

    private static final int TIMEOUT_MS = 20_000;

    private final RestClient restClient = buildRestClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static RestClient buildRestClient() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(TIMEOUT_MS))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofMillis(TIMEOUT_MS));
        return RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .requestFactory(factory)
                .build();
    }

    @Override
    public List<String> generarJustificaciones(List<String> prompts) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your_groq_api_key")) {
            throw new IllegalStateException("groq.api.key no configurada");
        }
        if (prompts.isEmpty()) return List.of();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres el asistente de ventas de un sistema agrícola. Para cada uno de los ")
                .append(prompts.size())
                .append(" productos/combos de abajo, redacta en español, en 1-2 frases, un mensaje breve ")
                .append("y persuasivo (sin emojis), usando solo los datos dados, sin inventar nada más. ")
                .append("Responde ÚNICAMENTE en formato JSON, con esta forma exacta: ")
                .append("{\"justificaciones\": [\"texto1\", \"texto2\", ...]}, con exactamente ")
                .append(prompts.size())
                .append(" elementos en el mismo orden, sin texto adicional ni markdown.\n\n");
        for (int i = 0; i < prompts.size(); i++) {
            prompt.append(i + 1).append(") ").append(prompts.get(i)).append('\n');
        }

        Map<String, Object> body = Map.of(
                "model", modelo,
                "messages", List.of(Map.of("role", "user", "content", prompt.toString())),
                "response_format", Map.of("type", "json_object"),
                "max_tokens", MAX_TOKENS
        );

        String rawBody = restClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .body(body)
                .retrieve()
                .body(String.class);

        return extraerTextos(rawBody, prompts.size());
    }

    private List<String> extraerTextos(String rawBody, int esperados) {
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String textoJson = root.path("choices").path(0)
                    .path("message").path("content").asText(null);
            if (textoJson == null) {
                throw new IllegalStateException("Respuesta de Groq sin contenido: " + rawBody);
            }
            JsonNode obj = objectMapper.readTree(textoJson);
            JsonNode arr = obj.path("justificaciones");
            if (!arr.isArray() || arr.size() != esperados) {
                throw new IllegalStateException("Respuesta de Groq con forma inesperada: " + textoJson);
            }
            List<String> resultado = new ArrayList<>();
            arr.forEach(n -> resultado.add(n.asText("").trim()));
            return resultado;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Respuesta de Groq no parseable: " + rawBody, e);
        }
    }
}
