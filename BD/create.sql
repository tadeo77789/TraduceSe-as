use TraduceSeña;
CREATE TABLE usuario (
    usuario INT PRIMARY KEY,
    nombre_completo VARCHAR(255),
    correo_electronico VARCHAR(255),
    contrasena VARCHAR(255),
    fecha_registro DATETIME,
    fecha_ultima_actualizacion DATETIME
);

CREATE TABLE traduccion (
    id_traduccion INT PRIMARY KEY,
    id_usuario INT,
    tipo_traduccion VARCHAR(255),
    contenido_origen TEXT,
    contenido_traducido TEXT,
    fecha_hora DATETIME,
    FOREIGN KEY (id_usuario) REFERENCES usuario(usuario)
);

CREATE TABLE EstadisticasUso (
    id_estadistica INT PRIMARY KEY,
    id_usuario INT,
    tipo_evento VARCHAR(255),
    valor INT,
    fecha_evento DATETIME,
    FOREIGN KEY (id_usuario) REFERENCES usuario(usuario)
);

CREATE TABLE Alarmas (
    id_alarma INT PRIMARY KEY,
    id_usuario INT,
    nombre_evento VARCHAR(255),
    fecha_hora_alarma DATETIME,
    activa bit,
    FOREIGN KEY (id_usuario) REFERENCES usuario(usuario)
);

CREATE TABLE LexicoSenas (
    id_sena INT PRIMARY KEY,
    id_usuario INT,
    palabra_letra VARCHAR(255),
    descripcion TEXT,
    categoria VARCHAR(255),
);

CREATE TABLE RecursosMultimedia (
    id_recursos INT PRIMARY KEY,
    id_sena INT,
    tipo_recurso VARCHAR(255),
    url_recurso VARCHAR(255),
    FOREIGN KEY (id_sena) REFERENCES LexicoSenas(id_sena)
);

