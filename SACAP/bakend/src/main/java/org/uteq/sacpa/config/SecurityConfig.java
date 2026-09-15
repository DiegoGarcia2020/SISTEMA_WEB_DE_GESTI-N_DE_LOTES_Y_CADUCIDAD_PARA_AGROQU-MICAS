package org.uteq.sacpa.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.uteq.sacpa.repository.seguridad.IUsuarioRepository;
import org.uteq.sacpa.security.JwtAuthenticationFilter;
import org.uteq.sacpa.security.JwtService;
import org.uteq.sacpa.security.UsuarioPrincipal;

import java.util.Arrays;

/**
 * Configuracion de seguridad SACPA.
 * Roles del sistema: ADMINISTRADOR, BODEGUERO, SUPERVISOR, TECNICO_CAMPO
 * Roles BD: agro_administrador, agro_bodeguero, agro_supervisor, agro_tecnico_campo
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    /** Fuerza bruta / credential stuffing: tras este número de intentos fallidos consecutivos
     *  se bloquea la cuenta temporalmente (ver authenticationProvider()). */
    private static final int MAX_INTENTOS_FALLIDOS = 5;
    private static final long MINUTOS_BLOQUEO = 15;

    private final JwtService jwtService;
    private final IUsuarioRepository usuarioRepository;

    @Bean
    @Transactional
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByCorreoWithRoles(username)
                .map(UsuarioPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
    }

    @Bean
    public org.springframework.security.authentication.AuthenticationProvider authenticationProvider() {
        return new org.springframework.security.authentication.AuthenticationProvider() {
            @Override
            public Authentication authenticate(Authentication authentication) throws AuthenticationException {
                String username = authentication.getName();
                String password = authentication.getCredentials().toString();
                UsuarioPrincipal user = (UsuarioPrincipal) userDetailsService().loadUserByUsername(username);

                if (!user.isAccountNonLocked()) {
                    long minutosRestantes = java.time.Duration.between(
                            java.time.LocalDateTime.now(), user.getUsuario().getBloqueadoHasta()).toMinutes() + 1;
                    throw new LockedException("Cuenta bloqueada temporalmente por múltiples intentos fallidos. "
                            + "Intente de nuevo en " + minutosRestantes + " minuto(s).");
                }

                if (!passwordEncoder().matches(password, user.getPassword())) {
                    registrarIntentoFallido(user.getUsuario());
                    throw new BadCredentialsException("Contrasena incorrecta");
                }
                if (!user.isEnabled()) {
                    throw new DisabledException("La cuenta esta inactiva");
                }

                if (user.getUsuario().getIntentosFallidos() != null && user.getUsuario().getIntentosFallidos() > 0) {
                    user.getUsuario().setIntentosFallidos(0);
                    user.getUsuario().setBloqueadoHasta(null);
                    usuarioRepository.save(user.getUsuario());
                }

                return new UsernamePasswordAuthenticationToken(user, password, user.getAuthorities());
            }

            private void registrarIntentoFallido(org.uteq.sacpa.entity.seguridad.Usuario usuario) {
                int intentos = (usuario.getIntentosFallidos() == null ? 0 : usuario.getIntentosFallidos()) + 1;
                usuario.setIntentosFallidos(intentos);
                if (intentos >= MAX_INTENTOS_FALLIDOS) {
                    usuario.setBloqueadoHasta(java.time.LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEO));
                }
                usuarioRepository.save(usuario);
            }

            @Override
            public boolean supports(Class<?> authentication) {
                return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService, userDetailsService());
    }

    @Bean
    public org.uteq.sacpa.security.RateLimitFilter rateLimitFilter() {
        return new org.uteq.sacpa.security.RateLimitFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Defensa en profundidad a nivel de cabeceras HTTP (Spring Security ya aplica
            // X-Content-Type-Options/X-Frame-Options por defecto; se dejan explícitos aquí
            // más HSTS y Referrer-Policy, que no vienen activados por defecto).
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(withDefaults -> {})
                .referrerPolicy(referrer -> referrer.policy(
                        org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000))
            )
            .authorizeHttpRequests(auth -> auth
                // Publico o con token previo: login, seleccion de rol, cambio de contraseña y solicitud de registro
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/seleccionar-rol",
                    "/api/auth/select-role",
                    "/api/auth/cambiar-contrasena",
                    "/api/registro/solicitar"
                ).permitAll()


                // WebSocket alertas en tiempo real
                .requestMatchers("/ws-sacpa/**").permitAll()

                // Solo ADMINISTRADOR
                .requestMatchers(
                    "/api/auth/**",
                    "/api/registro/**",
                    "/api/usuarios/**",
                    "/api/roles/**",
                    "/api/seguridad/**",
                    "/api/ia/modelos/**",
                    "/api/ia/reglas/**",
                    "/api/admin/**"
                ).hasAnyAuthority("ADMINISTRADOR")

                // Configuracion global: la lectura (GET, ej. IVA global para el formulario de
                // productos) queda abierta a cualquier autenticado, pero modificarla (PUT — IVA
                // global, proveedor de IA activo) es solo ADMINISTRADOR.
                .requestMatchers(HttpMethod.PUT, "/api/configuracion/**").hasAnyAuthority("ADMINISTRADOR")
                .requestMatchers("/api/configuracion/**").authenticated()

                // ADMINISTRADOR — gerencia (reportes tiene @PreAuthorize por endpoint)
                .requestMatchers(
                    "/api/gerencia/**"
                ).hasAnyAuthority("ADMINISTRADOR")
                
                .requestMatchers("/api/reportes/**").authenticated()

                // Lectura de combos/promociones activas para armar pedidos — también accesible al TECNICO
                .requestMatchers(
                    "/api/promociones/activas",
                    "/api/promociones/combos/activos"
                ).hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO")

                // Lectura de alertas de caducidad — también accesible al BODEGUERO (dashboard de kitting)
                .requestMatchers(HttpMethod.GET, "/api/alertas", "/api/alertas/activas", "/api/alertas/lote/**")
                    .hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "BODEGUERO")

                // ADMINISTRADOR y SUPERVISOR — alertas, sugerencias IA, promociones, proveedores
                .requestMatchers(
                    "/api/alertas/**",
                    "/api/ia/sugerencias/**",
                    "/api/promociones/**",
                    "/api/temporadas/**",
                    "/api/proveedores/**",
                    "/api/catalogos/**",
                    "/api/devoluciones/aprobar/**",
                    "/api/movimientos/aprobar/**",
                    "/api/supervisor/**"
                ).hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR")

                // ADMINISTRADOR y BODEGUERO — endpoints propios del bodeguero, acotados a su bodega
                .requestMatchers(
                    "/api/bodeguero/**"
                ).hasAnyAuthority("ADMINISTRADOR", "BODEGUERO")

                // Lectura de stock disponible para armar pedidos — también accesible al TECNICO
                .requestMatchers(
                    "/api/movimientos/lotes-disponibles",
                    "/api/lotes/disponibles"
                ).hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "BODEGUERO", "TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO")

                // ADMINISTRADOR, SUPERVISOR y BODEGUERO — inventario y lotes
                .requestMatchers(
                    "/api/lotes/**",
                    "/api/documentos-lote/**",
                    "/api/almacenes/**",
                    "/api/productos/**",
                    "/api/movimientos/**",
                    "/api/devoluciones/**"
                ).hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "BODEGUERO")

                // TECNICO_CAMPO — uso en campo
                .requestMatchers(
                    "/api/uso-campo/**"
                ).hasAnyAuthority("TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO")

                // TECNICO — Módulo 3: Ventas y Motor IA
                // Nota: la autoridad JWT es el valor literal de seguridad.rol.nombre en MAYÚSCULAS
                // (ver UsuarioPrincipal.getAuthorities()); el catálogo seguridad.rol quedó con dos
                // filas de merges distintos para "técnico" ("TECNICO" y "Técnico de Campo"), por eso
                // se aceptan ambas variantes (más "TECNICO_CAMPO" del matcher histórico de uso-campo).
                .requestMatchers(
                    "/api/clientes/**",
                    "/api/ventas/**"
                ).hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO")

                // Ventas operativas — solo TECNICO + ADMINISTRADOR + SUPERVISOR
                .requestMatchers("/api/operaciones/ventas/**")
                    .hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO")

                // Pedidos operativos — TECNICO (crea/consulta) + BODEGUERO (despacha) + ADMINISTRADOR + SUPERVISOR
                .requestMatchers("/api/operaciones/pedidos/**")
                    .hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO", "BODEGUERO")

                // Confirmar entrega (Última Milla) — la hace el TECNICO en campo, no Bodega
                .requestMatchers(HttpMethod.PUT, "/api/operaciones/despachos/*/entregar")
                    .hasAnyAuthority("ADMINISTRADOR", "BODEGUERO", "TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO")

                // Resto de Despachos (preparar) — solo BODEGUERO + ADMINISTRADOR
                .requestMatchers("/api/operaciones/despachos/**")
                    .hasAnyAuthority("ADMINISTRADOR", "BODEGUERO")

                // Devoluciones de venta — TECNICO (registra en campo) + BODEGUERO (recibe física) + ADMINISTRADOR + SUPERVISOR
                .requestMatchers("/api/operaciones/devoluciones-venta/**")
                    .hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "TECNICO", "TECNICO_CAMPO", "TÉCNICO DE CAMPO", "BODEGUERO")

                // Órdenes de compra — SUPERVISOR (crea/anula) + BODEGUERO (recepciona) + ADMINISTRADOR
                .requestMatchers("/api/ordenes-compra/**")
                    .hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "BODEGUERO")

                // Notificaciones: cualquier usuario autenticado
                .requestMatchers("/api/notificaciones/**").authenticated()

                // Cualquier otra ruta: autenticado
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter(), JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Active-Role"
        ));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}