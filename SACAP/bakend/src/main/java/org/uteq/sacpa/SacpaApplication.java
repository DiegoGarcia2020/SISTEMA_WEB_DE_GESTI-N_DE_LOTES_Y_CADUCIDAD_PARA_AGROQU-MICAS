package org.uteq.sacpa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SacpaApplication {
    public static void main(String[] args) {
        // En esta red las salidas por IPv4 a hosts externos (p.ej. Gemini) se cuelgan pero IPv6 sí responde,
        // y Java no reintenta automáticamente con la otra familia si la primera falla.
        System.setProperty("java.net.preferIPv6Addresses", "true");
        SpringApplication.run(SacpaApplication.class, args);
    }
}
