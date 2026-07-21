-- ==============================================================================
-- SCRIPT DE BASE DE DATOS SACPA: EMPLEADOS Y SOLICITUDES DE REGISTRO
-- ==============================================================================

-- 1. AGREGAR INDICADOR DE CAMBIO DE CLAVE TEMPORAL EN USUARIO
ALTER TABLE IF EXISTS seguridad.usuario
ADD COLUMN IF NOT EXISTS requiere_cambio_clave BOOLEAN DEFAULT FALSE;

-- 2. TABLA DE EMPLEADOS (DATOS PERSONALES SEPARADOS DE SEGURIDAD.USUARIO)
CREATE TABLE IF NOT EXISTS gerencia.empleado (
    id_empleado SERIAL PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    departamento VARCHAR(100),
    cargo VARCHAR(100),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    foto_perfil TEXT,
    id_usuario INTEGER REFERENCES seguridad.usuario(id_usuario) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. TABLA DE SOLICITUDES DE REGISTRO PENDIENTES (AUTO-REGISTRO DE EMPLEADOS)
CREATE TABLE IF NOT EXISTS seguridad.solicitud_registro (
    id_solicitud SERIAL PRIMARY KEY,
    correo VARCHAR(150) NOT NULL,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    telefono VARCHAR(30),
    departamento VARCHAR(100),
    cargo VARCHAR(100),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_estado INTEGER DEFAULT 1, -- 1 = PENDIENTE, 2 = APROBADA, 3 = RECHAZADA
    motivo_rechazo TEXT,
    procesado_por INTEGER REFERENCES seguridad.usuario(id_usuario),
    fecha_procesamiento TIMESTAMP
);

-- 4. ÍNDICES ÚTILES
CREATE INDEX IF NOT EXISTS idx_empleado_cedula ON gerencia.empleado(cedula);
CREATE INDEX IF NOT EXISTS idx_solicitud_estado ON seguridad.solicitud_registro(id_estado);

SELECT 'Tablas gerencia.empleado y seguridad.solicitud_registro creadas correctamente.' AS resultado;
