package org.uteq.sacpa.service.seguridad.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.service.seguridad.IRespaldoService;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RespaldoServiceImpl implements IRespaldoService {

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${sacpa.pgdump.path:C:\\\\Program Files\\\\PostgreSQL\\\\18\\\\bin\\\\pg_dump.exe}")
    private String pgDumpPath;

    // Default values if URL parsing fails
    private String dbHost = "localhost";
    private String dbPort = "5432";
    private String dbName = "SCAPAV2";

    @Value("${spring.datasource.url}")
    public void setDbUrl(String dbUrl) {
        // Parse jdbc:postgresql://localhost:5432/SCAPAV2
        try {
            String cleanUrl = dbUrl.replace("jdbc:postgresql://", "");
            String[] parts = cleanUrl.split("/");
            if (parts.length == 2) {
                dbName = parts[1].split("\\?")[0];
                String[] hostPort = parts[0].split(":");
                if (hostPort.length == 2) {
                    dbHost = hostPort[0];
                    dbPort = hostPort[1];
                } else if (hostPort.length == 1) {
                    dbHost = hostPort[0];
                }
            }
        } catch (Exception e) {
            log.error("Error parsing DB URL", e);
        }
    }

    @Override
    public Map<String, Object> ejecutarRespaldo(String tipo) {
        Map<String, Object> resultado = new HashMap<>();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String directorioRespaldos = "respaldos_bd";
        
        try {
            Path path = Paths.get(directorioRespaldos);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }

            // Verificar que pg_dump existe
            File pgDumpFile = new File(pgDumpPath);
            if (!pgDumpFile.exists()) {
                log.warn("pg_dump no encontrado en: {}. Intentando con PATH del sistema.", pgDumpPath);
                pgDumpPath = "pg_dump"; // Fallback al PATH del sistema
            }

            String archivoSalida = directorioRespaldos + File.separator + "backup_" + tipo.toLowerCase() + "_" + timestamp;
            ProcessBuilder processBuilder;

            if ("FULL".equalsIgnoreCase(tipo)) {
                archivoSalida += ".backup";
                processBuilder = new ProcessBuilder(
                        pgDumpPath,
                        "-F", "c",
                        "-h", dbHost,
                        "-p", dbPort,
                        "-U", dbUser,
                        "-f", archivoSalida,
                        dbName
                );
            } else if ("INCREMENTAL".equalsIgnoreCase(tipo)) {
                archivoSalida += ".sql";
                processBuilder = new ProcessBuilder(
                        pgDumpPath,
                        "-F", "p",
                        "-h", dbHost,
                        "-p", dbPort,
                        "-U", dbUser,
                        "-a",
                        "-f", archivoSalida,
                        dbName
                );
            } else {
                throw new IllegalArgumentException("Tipo de respaldo no soportado: " + tipo);
            }

            // Establecer la contraseña como variable de entorno
            Map<String, String> env = processBuilder.environment();
            env.put("PGPASSWORD", dbPassword);
            
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            int exitCode = process.waitFor();

            resultado.put("tipo", tipo);
            resultado.put("exitCode", exitCode);
            resultado.put("rutaArchivo", archivoSalida);
            resultado.put("timestamp", timestamp);

            if (exitCode == 0) {
                resultado.put("mensaje", "Respaldo " + tipo + " generado exitosamente.");
            } else {
                resultado.put("mensaje", "Error al generar el respaldo. Código de salida: " + exitCode);
                log.error("Error en pg_dump, código de salida: " + exitCode);
            }

        } catch (Exception e) {
            log.error("Error ejecutando respaldo", e);
            resultado.put("tipo", tipo);
            resultado.put("exitCode", -1);
            resultado.put("mensaje", "Excepción al ejecutar respaldo: " + e.getMessage());
            resultado.put("timestamp", timestamp);
        }

        return resultado;
    }
}

