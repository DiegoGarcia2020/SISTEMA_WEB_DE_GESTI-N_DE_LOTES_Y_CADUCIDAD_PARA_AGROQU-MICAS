package org.uteq.sacpa.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting por IP para endpoints públicos sensibles a bots/fuerza bruta distribuida
 * (login, solicitud de registro). El bloqueo por intentos fallidos en SecurityConfig
 * protege una CUENTA puntual; esto protege contra un mismo origen probando muchas cuentas
 * distintas, o simplemente golpeando el endpoint con tráfico automatizado.
 *
 * Ventana deslizante simple en memoria -- suficiente para una sola instancia (no hay
 * balanceador/múltiples réplicas en este despliegue). No requiere una librería nueva.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LIMITE_POR_VENTANA = 15;
    private static final long VENTANA_SEGUNDOS = 60;

    /** Solo se limita lo público sin autenticación previa: el resto ya exige un JWT válido,
     *  que es una barrera mucho más fuerte que cualquier límite por IP. */
    private static final java.util.Set<String> RUTAS_LIMITADAS = java.util.Set.of(
            "/api/auth/login", "/api/registro/solicitar"
    );

    private record Contador(AtomicInteger cantidad, long inicioVentana) {}

    private final ConcurrentHashMap<String, Contador> contadores = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        if (!RUTAS_LIMITADAS.contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = resolverIp(request);
        long ahora = Instant.now().getEpochSecond();

        Contador actual = contadores.compute(ip, (key, existente) -> {
            if (existente == null || ahora - existente.inicioVentana() >= VENTANA_SEGUNDOS) {
                return new Contador(new AtomicInteger(1), ahora);
            }
            existente.cantidad().incrementAndGet();
            return existente;
        });

        if (actual.cantidad().get() > LIMITE_POR_VENTANA) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"Too Many Requests\",\"message\":\"Demasiados intentos. Intente de nuevo en un minuto.\",\"status\":429}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolverIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
