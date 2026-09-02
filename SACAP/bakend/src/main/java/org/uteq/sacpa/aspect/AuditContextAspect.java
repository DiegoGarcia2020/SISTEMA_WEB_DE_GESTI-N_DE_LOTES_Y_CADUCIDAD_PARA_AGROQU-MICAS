package org.uteq.sacpa.aspect;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.uteq.sacpa.config.UserContext;

/**
 * Expone el usuario y rol de aplicacion de la petición actual como variables de
 * sesion de PostgreSQL (scope de transaccion), para que los triggers de
 * auditoria (seguridad.fn_registrar_auditoria) sepan quien y con que rol
 * ejecuto cada operacion. No cambia el rol de conexion a la base de datos
 * (a diferencia de DatabaseRoleAspect) — es intencionalmente independiente
 * de esa restriccion de permisos.
 */
@Aspect
@Component
@RequiredArgsConstructor
public class AuditContextAspect {

    private final JdbcTemplate jdbcTemplate;

    @Around("execution(* org.uteq.sacpa.repository..*.*(..))")
    public Object exponerContextoAuditoria(ProceedingJoinPoint joinPoint) throws Throwable {
        Integer idUsuario = UserContext.getUserId();
        String rolApp = UserContext.getAppRole();

        jdbcTemplate.queryForObject("SELECT set_config('sacpa.current_user_id', ?, true)", String.class,
                idUsuario != null ? String.valueOf(idUsuario) : "");
        jdbcTemplate.queryForObject("SELECT set_config('sacpa.current_app_role', ?, true)", String.class,
                rolApp != null ? rolApp : "");

        return joinPoint.proceed();
    }
}
