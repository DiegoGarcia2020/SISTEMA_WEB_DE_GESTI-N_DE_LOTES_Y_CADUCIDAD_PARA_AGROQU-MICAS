package org.uteq.sacpa.service.notificacion;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

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

        log.info("===================================================================");
        log.info(">>> [NOTIFICACIÓN CORREO SACPA] Preparando envío de credenciales");
        log.info(">>> Destinatario: {} (Usuario: {})", correoDestinatario, nombreUsuario);
        log.info(">>> Asunto: {}", asunto);
        log.info(">>> Contraseña Temporal: {}", contrasena);
        log.info("===================================================================");

        enviarCorreo(correoDestinatario, asunto, mensaje);
    }

    /**
     * Notifica al proveedor (titular del registro/importador) cuando un lote de su producto
     * caduca en bodega -- AGROCALIDAD Resolución 0227, Anexo 1 punto 23. El proveedor necesita
     * saberlo para coordinar retiro/disposición del producto vencido y para su propio reporte
     * de trazabilidad.
     */
    public void enviarNotificacionLoteCaducado(String correoProveedor, String nombreProveedor,
                                                String nombreProducto, String numeroLote,
                                                LocalDate fechaVencimiento, Integer cantidadCaducada) {
        if (correoProveedor == null || correoProveedor.isBlank()) {
            log.warn(">>> [CADUCIDAD] Proveedor {} no tiene correo de contacto registrado; no se pudo notificar el lote {}.",
                    nombreProveedor, numeroLote);
            return;
        }

        String asunto = "SACPA - Aviso de producto caducado en bodega: " + nombreProducto;
        String mensaje = "Estimado/a " + (nombreProveedor != null ? nombreProveedor : "Proveedor") + ",\n\n"
                + "Le informamos que el siguiente lote de su producto ha caducado en nuestra bodega y fue retirado de la venta:\n\n"
                + "--------------------------------------------------------\n"
                + "Producto: " + nombreProducto + "\n"
                + "Lote: " + numeroLote + "\n"
                + "Fecha de vencimiento: " + fechaVencimiento + "\n"
                + "Cantidad caducada: " + (cantidadCaducada != null ? cantidadCaducada : "N/D") + "\n"
                + "--------------------------------------------------------\n\n"
                + "Por favor coordine con nuestra bodega el retiro o disposición final del producto conforme a la normativa "
                + "de AGROCALIDAD para plaguicidas caducados.\n\n"
                + "Atentamente,\n"
                + "Equipo de Bodega - SACPA AgroSense";

        log.info(">>> [CADUCIDAD] Notificando a proveedor {} ({}) sobre lote caducado {} de {}",
                nombreProveedor, correoProveedor, numeroLote, nombreProducto);
        enviarCorreo(correoProveedor, asunto, mensaje);
    }

    private void enviarCorreo(String destinatario, String asunto, String mensaje) {
        try {
            if ("your_email@gmail.com".equalsIgnoreCase(remitente) || remitente == null || remitente.isBlank()) {
                log.warn(">>> [SMTP AVISO] No se ha configurado una cuenta SMTP real en application.properties (spring.mail.username=your_email@gmail.com). El correo se registró en consola.");
                return;
            }

            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(remitente);
            mailMessage.setTo(destinatario);
            mailMessage.setSubject(asunto);
            mailMessage.setText(mensaje);

            javaMailSender.send(mailMessage);
            log.info(">>> [NOTIFICACIÓN CORREO SACPA] ¡Correo enviado exitosamente a {}!", destinatario);
        } catch (Exception e) {
            log.error(">>> [ERROR SMTP] No se pudo conectar al servidor de correo SMTP para enviar a {}: {}. Verifique spring.mail.username/password en application.properties.", destinatario, e.getMessage());
        }
    }
}
