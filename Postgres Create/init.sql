-- ==========================================
-- SCRIPT DE INICIALIZACIÓN - SISTEMA EL-PIOJO
-- Este script crea las tablas e inserta datos 
-- automáticamente al levantar el contenedor.
-- ==========================================

-- 1. CATÁLOGOS BASE Y SEGURIDAD
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios_sistema (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Aquí guardaremos el Hash de bcrypt, NUNCA texto plano
    id_rol INT NOT NULL REFERENCES roles(id_rol)
);

CREATE TABLE carreras (
    id_carrera SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    clave VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE departamentos (
    id_departamento SERIAL PRIMARY KEY,
    nombre_depto VARCHAR(100) NOT NULL
);

CREATE TABLE puntos_acceso (
    id_punto SERIAL PRIMARY KEY,
    ubicacion VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL -- Ej: 'Torniquete Principal', 'Laboratorio', 'Estacionamiento'
);

-- 2. ENTIDADES PRINCIPALES
CREATE TABLE grupos (
    id_grupo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    semestre INT NOT NULL,
    id_carrera INT NOT NULL REFERENCES carreras(id_carrera) ON DELETE CASCADE
);

CREATE TABLE alumnos (
    id_alumno SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    id_grupo INT NOT NULL REFERENCES grupos(id_grupo),
    estado_academico VARCHAR(50) DEFAULT 'Activo'
);

CREATE TABLE empleados (
    id_empleado SERIAL PRIMARY KEY,
    num_empleado VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    id_departamento INT NOT NULL REFERENCES departamentos(id_departamento)
);

CREATE TABLE visitantes (
    id_visitante SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    identificacion VARCHAR(50) NOT NULL,
    motivo_frecuente VARCHAR(255)
);

-- 3. REGLAS DE NEGOCIO Y SANCIONES
CREATE TABLE horarios (
    id_horario SERIAL PRIMARY KEY,
    id_grupo INT NOT NULL REFERENCES grupos(id_grupo) ON DELETE CASCADE,
    dia_semana VARCHAR(15) NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL
);

CREATE TABLE sanciones (
    id_sancion SERIAL PRIMARY KEY,
    id_alumno INT NOT NULL REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
    motivo VARCHAR(255) NOT NULL,
    bloquea_acceso BOOLEAN DEFAULT TRUE,
    fecha_fin DATE NOT NULL
);

-- 4. CREDENCIALES Y PASES (Vectores de Acceso)
CREATE TABLE credenciales (
    id_credencial SERIAL PRIMARY KEY,
    id_alumno INT REFERENCES alumnos(id_alumno) ON DELETE CASCADE,
    id_empleado INT REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    codigo_qr_hash VARCHAR(255) UNIQUE NOT NULL, -- El QR encriptado para evitar clonaciones
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activa',
    -- Restricción: Una credencial debe ser de un alumno O de un empleado, no de ambos ni de ninguno.
    CONSTRAINT chk_propietario CHECK (
        (id_alumno IS NOT NULL AND id_empleado IS NULL) OR 
        (id_alumno IS NULL AND id_empleado IS NOT NULL)
    )
);

CREATE TABLE pases_visita (
    id_pase SERIAL PRIMARY KEY,
    id_visitante INT NOT NULL REFERENCES visitantes(id_visitante) ON DELETE CASCADE,
    id_usuario_autoriza INT NOT NULL REFERENCES usuarios_sistema(id_usuario),
    codigo_qr_hash VARCHAR(255) UNIQUE NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    estado VARCHAR(20) DEFAULT 'Vigente'
);

-- 5. LA TABLA DE ALTO TRÁFICO (El Historial)
CREATE TABLE registros_acceso (
    id_registro BIGSERIAL PRIMARY KEY, -- BIGSERIAL porque esta tabla crecerá masivamente
    id_credencial INT REFERENCES credenciales(id_credencial) ON DELETE SET NULL,
    id_pase INT REFERENCES pases_visita(id_pase) ON DELETE SET NULL,
    id_punto INT NOT NULL REFERENCES puntos_acceso(id_punto),
    id_usuario INT REFERENCES usuarios_sistema(id_usuario), -- Quién supervisaba el acceso (opcional)
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acceso_concedido BOOLEAN NOT NULL,
    motivo_rechazo VARCHAR(255),
    CONSTRAINT chk_metodo_acceso CHECK (
        (id_credencial IS NOT NULL AND id_pase IS NULL) OR 
        (id_credencial IS NULL AND id_pase IS NOT NULL)
    )
);

-- 6. ÍNDICES DE RENDIMIENTO (El secreto para que no se trabe)
-- Estos índices son mapas internos que hacen que buscar accesos en millones de registros tarde milisegundos.
CREATE INDEX idx_registros_fecha ON registros_acceso(fecha_hora);
CREATE INDEX idx_registros_credencial ON registros_acceso(id_credencial);
CREATE INDEX idx_credenciales_qr ON credenciales(codigo_qr_hash);
CREATE INDEX idx_alumnos_matricula ON alumnos(matricula);


--DATOS DE PRUEBA: ALUMNOS, EMPLEADOS Y ACCESOS


--Agregar Departamentos (Para los empleados)
INSERT INTO departamentos (nombre_depto) VALUES 
('Sistemas y Computación'),
('Administración Escolar');

--  Agregar Empleados (Profesores / Staff)
INSERT INTO empleados (num_empleado, nombre_completo, id_departamento) VALUES 
('EMP-1001', 'Roberto Gómez Bolaños', 1),
('EMP-1002', 'Carmen Salinas', 2);

-- Agregar Alumnos (En diferentes grupos y estados)
INSERT INTO alumnos (matricula, nombre_completo, id_grupo, estado_academico) VALUES 
('23010001', 'Juan Pérez Gómez', 1, 'Activo'),          -- Alumno normal
('23010002', 'María López Ruiz', 1, 'Activo'),          -- Alumno normal
('23010003', 'Carlos Sánchez', 12, 'Activo'),           -- Del "Grupo Especial"
('23020001', 'Luis Ramírez', 13, 'Baja Temporal'),      -- Alumno inactivo
('23010005', 'Ana Torres', 2, 'Activo');                -- Alumno que tendrá sanción

-- Poner una Sanción de prueba
INSERT INTO sanciones (id_alumno, motivo, bloquea_acceso, fecha_fin) VALUES 
(5, 'Adeudo de colegiatura o biblioteca', true, '2026-03-15'); -- Ana Torres está bloqueada

-- Generar Credenciales (Con códigos QR simulados)
INSERT INTO credenciales (id_alumno, id_empleado, codigo_qr_hash, fecha_vencimiento, estado) VALUES 
(1, NULL, 'hash_juan_qr_123', '2026-12-31', 'Activa'),      -- ID Credencial 1 (Juan)
(2, NULL, 'hash_maria_qr_456', '2026-12-31', 'Activa'),     -- ID Credencial 2 (María)
(4, NULL, 'hash_luis_qr_789', '2026-12-31', 'Inactiva'),    -- ID Credencial 3 (Luis, Inactivo)
(NULL, 1, 'hash_profe_roberto_qr', '2030-12-31', 'Activa'); -- ID Credencial 4 (Profe Roberto)

-- Crear Puntos de Acceso físicos
INSERT INTO puntos_acceso (ubicacion, tipo) VALUES 
('Edificio Principal', 'Torniquete Principal'),
('Edificio de Sistemas', 'Laboratorio de Cómputo');

-- Simular un Historial de Escaneos (Para que tu tabla masiva no esté vacía)
INSERT INTO registros_acceso (id_credencial, id_punto, acceso_concedido, motivo_rechazo) VALUES 
(1, 1, true, NULL),                                      -- Juan entró al Edificio Principal
(2, 1, true, NULL),                                      -- María entró al Edificio Principal
(4, 2, true, NULL),                                      -- El profe entró al Laboratorio
(3, 1, false, 'Credencial Inactiva - Baja Temporal'),    -- Luis intentó entrar pero el sistema lo rebotó
(1, 1, true, NULL);                                      -- Juan volvió a escanear más tarde