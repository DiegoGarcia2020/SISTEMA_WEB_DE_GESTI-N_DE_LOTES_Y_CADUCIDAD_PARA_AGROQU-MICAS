package org.uteq.sacpa.service.notificacion;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:no-reply@sacpa-agro.com}")
    private String remitente;

    public void enviarCredencialesUsuario(String correoDestinatario, String contrasena) {
        String nombreUsuario = correoDestinatario != null && correoDestinatario.contains("@") 
                ? correoDestinatario.split("@")[0] 
                : correoDestinatario;

        String asunto = "Bienvenido a SACPA Agroindustria - Sus Credenciales de Acceso";
        String mensaje = "Estimado/a Usuario/a,\n\n"
                + "Le informamos que su cuenta en el Sistema Agroindustrial SACPA ha sido registrada o aprobada exitosamente según su cargo y función en la empresa.\n\n"
                + "Sus credenciales oficiales de acceso para ingresar a la plataforma son:\n"
                + "--------------------------------------------------------\n"
                + "Usuario: " + nombreUsuario + "\n"
                + "Correo Electrónico: " + correoDestinatario + "\n"
                + "Contraseña Temporal: " + contrasena + "\n"
                + "--------------------------------------------------------\n\n"
                + "Nota: Puede iniciar sesión utilizando su nombre de usuario (" + nombreUsuario + ") o su dirección de correo electrónico.\n"
                + "Por favor, acceda al sistema y cambie su contraseña temporal lo antes posible por motivos de seguridad.\n\n"
                + "Atentamente,\n"
                + "Equipo de Administración y Soporte - SACPA AgroSense";

        // Siempre registrar en consola para auditoría inmediata
        log.info("===================================================================");
        log.info(">>> [NOTIFICACIÓN CORREO SACPA] Preparando envío de credenciales");
        log.info(">>> Destinatario: {} (Usuario: {})", correoDestinatario, nombreUsuario);
        log.info(">>> Asunto: {}", asunto);
        log.info(">>> Contraseña Temporal: {}", contrasena);
        log.info("===================================================================");

        try {
            if ("your_email@gmail.com".equalsIgnoreCase(remitente) || remitente == null || remitente.isBlank()) {
                log.warn(">>> [SMTP AVISO] No se ha configurado una cuenta SMTP real en application.properties (spring.mail.username=your_email@gmail.com). El correo se registró en consola.");
                return;
            }

            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(remitente);
            mailMessage.setTo(correoDestinatario);
            mailMessage.setSubject(asunto);
            mailMessage.setText(mensaje);

            javaMailSender.send(mailMessage);
            log.info(">>> [NOTIFICACIÓN CORREO SACPA] ¡Correo enviado exitosamente a {}!", correoDestinatario);
        } catch (Exception e) {
            log.error(">>> [ERROR SMTP] No se pudo conectar al servidor de correo SMTP para enviar a {}: {}. Verifique spring.mail.username/password en application.properties.", correoDestinatario, e.getMessage());
        }
    }
}
