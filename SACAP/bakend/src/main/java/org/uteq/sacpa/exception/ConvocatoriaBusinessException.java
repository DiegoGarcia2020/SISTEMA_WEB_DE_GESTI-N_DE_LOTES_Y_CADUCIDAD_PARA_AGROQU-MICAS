package org.uteq.sacpa.exception;

public class ConvocatoriaBusinessException extends RuntimeException {
    private final String codigo;

    public ConvocatoriaBusinessException(String message, String codigo) {
        super(message);
        this.codigo = codigo;
    }

    public String getCodigo() {
        return codigo;
    }
}
