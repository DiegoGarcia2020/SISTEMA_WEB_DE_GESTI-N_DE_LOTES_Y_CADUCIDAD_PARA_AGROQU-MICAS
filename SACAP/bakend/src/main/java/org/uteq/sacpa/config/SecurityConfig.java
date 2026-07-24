package org.uteq.sacpa.config;

import lombok.RequiredArgsConstructor;
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
 * Roles del sistema: ADMINISTRADOR, GERENTE, BODEGUERO, SUPERVISOR, PROVEEDOR, TECNICO_CAMPO
 * Roles BD: agro_administrador, agro_gerente, agro_bodeguero, agro_supervisor, agro_proveedor, agro_tecnico_campo
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

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
                UserDetails user = userDetailsService().loadUserByUsername(username);
                if (!passwordEncoder().matches(password, user.getPassword())) {
                    throw new BadCredentialsException("Contrasena incorrecta");
                }
                if (!user.isEnabled()) {
                    throw new DisabledException("La cuenta esta inactiva");
                }
                return new UsernamePasswordAuthenticationToken(user, password, user.getAuthorities());
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
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
                    "/api/catalogos/**",
                    "/api/usuarios/**",
                    "/api/roles/**",
                    "/api/seguridad/**",
                    "/api/ia/modelos/**",
                    "/api/ia/reglas/**"
                ).hasAnyAuthority("ADMINISTRADOR")

                // ADMINISTRADOR y GERENTE — reportes y gerencia
                .requestMatchers(
                    "/api/reportes/**",
                    "/api/gerencia/**"
                ).hasAnyAuthority("ADMINISTRADOR", "GERENTE")

                // ADMINISTRADOR y SUPERVISOR — alertas, sugerencias IA, promociones
                .requestMatchers(
                    "/api/alertas/**",
                    "/api/ia/sugerencias/**",
                    "/api/promociones/**",
                    "/api/temporadas/**",
                    "/api/devoluciones/aprobar/**",
                    "/api/movimientos/aprobar/**"
                ).hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR")

                // ADMINISTRADOR, SUPERVISOR y BODEGUERO — inventario y lotes
                .requestMatchers(
                    "/api/lotes/**",
                    "/api/almacenes/**",
                    "/api/productos/**",
                    "/api/movimientos/**",
                    "/api/devoluciones/**",
                    "/api/documentos-lote/**"
                ).hasAnyAuthority("ADMINISTRADOR", "SUPERVISOR", "BODEGUERO")

                // PROVEEDOR — ver sus lotes y catalogo
                .requestMatchers(
                    "/api/proveedores/mis-lotes/**"
                ).hasAuthority("PROVEEDOR")

                // TECNICO_CAMPO — uso en campo
                .requestMatchers(
                    "/api/uso-campo/**"
                ).hasAuthority("TECNICO_CAMPO")

                // Notificaciones: cualquier usuario autenticado
                .requestMatchers("/api/notificaciones/**").authenticated()

                // Cualquier otra ruta: autenticado
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

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