package org.uteq.sacpa.service.ia_externa.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.uteq.sacpa.service.ia_externa.IGeminiIAService;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Llama a la API de Gemini (Google AI Studio) solo para redactar el texto de las
 * justificaciones del Motor de Sugerencias. El score, el descuento y las reglas de
 * negocio (stock, vencimiento) los sigue calculando MotorSugerenciaIAServiceImpl de
 * forma determinística — esta clase nunca decide qué ni cuánto vender.
 */
@Service
public class GeminiIAServiceImpl implements IGeminiIAService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.6-flash}")
    private String modelo;

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
                .baseUrl("https://generativelanguage.googleapis.com")
                .requestFactory(factory)
                .build();
    }

    @Override
    public List<String> generarJustificaciones(List<String> prompts) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your_gemini_api_key")) {
            throw new IllegalStateException("gemini.api.key no configurada");
        }
        if (prompts.isEmpty()) return List.of();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Eres el asistente de ventas de un sistema agrícola. Para cada uno de los ")
                .append(prompts.size())
                .append(" productos/combos de abajo, redacta en español, en 1-2 frases, un mensaje breve ")
                .append("y persuasivo (sin emojis), usando solo los datos dados, sin inventar nada más. ")
                .append("Responde ÚNICAMENTE un array JSON de exactamente ")
                .append(prompts.size())
                .append(" strings, uno por cada producto/combo y en el mismo orden, sin texto adicional ni markdown.\n\n");
        for (int i = 0; i < prompts.size(); i++) {
            prompt.append(i + 1).append(") ").append(prompts.get(i)).append('\n');
        }

        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt.toString())))),
                "generationConfig", Map.of("responseMimeType", "application/json")
        );

        String rawBody = restClient.post()
                .uri("/v1beta/models/{modelo}:generateContent?key={key}", modelo, apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        return extraerTextos(rawBody, prompts.size());
    }

    private List<String> extraerTextos(String rawBody, int esperados) {
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String textoJson = root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText(null);
            if (textoJson == null) {
                throw new IllegalStateException("Respuesta de Gemini sin texto: " + rawBody);
            }
            JsonNode arr = objectMapper.readTree(textoJson);
            if (!arr.isArray() || arr.size() != esperados) {
                throw new IllegalStateException("Respuesta de Gemini con forma inesperada: " + textoJson);
            }
            List<String> resultado = new ArrayList<>();
            arr.forEach(n -> resultado.add(n.asText("").trim()));
            return resultado;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Respuesta de Gemini no parseable: " + rawBody, e);
        }
    }
}
