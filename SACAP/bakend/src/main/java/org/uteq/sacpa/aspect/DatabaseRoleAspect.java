package org.uteq.sacpa.aspect;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.uteq.sacpa.config.UserContext;

/**
 * AOP Aspect que cambia el rol de base de datos por cada request.
 * Mapeo de roles de aplicacion a roles de BD PostgreSQL del sistema SACPA:
 *
 *  ADMINISTRADOR  -> agro_administrador
 *  GERENTE        -> agro_gerente
 *  BODEGUERO      -> agro_bodeguero
 *  SUPERVISOR     -> agro_supervisor
 *  PROVEEDOR      -> agro_proveedor
 *  TECNICO_CAMPO  -> agro_tecnico_campo
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseRoleAspect {

    private final JdbcTemplate jdbcTemplate;

    @Around("within(org.uteq.sacpa.repository..*)")
    public Object switchDatabaseRole(ProceedingJoinPoint joinPoint) throws Throwable {
        String rolApp = UserContext.getAppRole();
        String rolBD  = mapearRolBD(rolApp);

        if (rolBD != null) {
            log.debug("[SACPA-AOP] Activando rol BD: {} (rol app: {})", rolBD, rolApp);
            jdbcTemplate.execute("SET LOCAL ROLE \"" + rolBD + "\"");
        }

        try {
            return joinPoint.proceed();
        } finally {
            if (rolBD != null) {
                jdbcTemplate.execute("RESET ROLE");
            }
        }
    }

    /**
     * Mapea el rol de la aplicacion (del JWT) al rol de la base de datos PostgreSQL.
     */
    private String mapearRolBD(String rolApp) {
        if (rolApp == null) return null;
        return switch (rolApp.toUpperCase()) {
            case "ADMINISTRADOR"  -> "agro_administrador";
            case "GERENTE"        -> "agro_gerente";
            case "BODEGUERO"      -> "agro_bodeguero";
            case "SUPERVISOR"     -> "agro_supervisor";
            case "PROVEEDOR"      -> "agro_proveedor";
            case "TECNICO_CAMPO"  -> "agro_tecnico_campo";
            default -> {
                log.warn("[SACPA-AOP] Rol de aplicacion no reconocido: {}", rolApp);
                yield null;
            }
        };
    }
}