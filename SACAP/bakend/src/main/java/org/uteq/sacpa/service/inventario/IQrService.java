package org.uteq.sacpa.service.inventario;

public interface IQrService {
    /** Genera una imagen PNG del código QR como byte array */
    byte[] generarQrPng(String texto, int ancho, int alto);

    /** Genera la cadena Base64 Data URL de la imagen QR (ej: "data:image/png;base64,...") */
    String generarQrBase64(String texto, int ancho, int alto);
}
