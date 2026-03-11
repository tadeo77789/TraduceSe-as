CREATE TRIGGER trg_registrar_estadistica_traduccion
ON traduccion
AFTER INSERT
AS
BEGIN
    INSERT INTO EstadisticasUso (id_estadistica, id_usuario, tipo_evento, valor, fecha_evento)
    SELECT 
        (SELECT ISNULL(MAX(id_estadistica), 0) + ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) FROM EstadisticasUso),
        i.id_usuario,
        'traduccion_realizada',
        1,
        GETDATE()
    FROM inserted i;
END;

CREATE TABLE Log_Usuario (
    id_log INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    accion VARCHAR(50) NOT NULL,          -- INSERT / UPDATE / DELETE
    campo_modificado VARCHAR(255) NULL,   -- qué columna cambió
    valor_anterior VARCHAR(MAX) NULL,
    valor_nuevo VARCHAR(MAX) NULL,
    fecha_log DATETIME DEFAULT GETDATE(),
    realizado_por VARCHAR(255) NULL       
);

CREATE TRIGGER trg_log_usuario_insert
ON usuario
AFTER INSERT
AS
BEGIN
    INSERT INTO Log_Usuario (usuario_id, accion, campo_modificado, valor_anterior, valor_nuevo, realizado_por)
    SELECT 
        i.usuario,
        'INSERT',
        NULL,
        NULL,
        CONCAT('Nombre: ', i.nombre_completo, 
               ', Correo: ', i.correo_electronico,
               ', Fecha Registro: ', CONVERT(VARCHAR, i.fecha_registro, 120)),
        SYSTEM_USER
    FROM inserted i;
END;

CREATE TRIGGER trg_log_usuario_update
ON usuario
AFTER UPDATE
AS
BEGIN
    -- Nombre cambiado
    INSERT INTO Log_Usuario (usuario_id, accion, campo_modificado, valor_anterior, valor_nuevo, realizado_por)
    SELECT 
        i.usuario,
        'UPDATE',
        'nombre_completo',
        d.nombre_completo,
        i.nombre_completo,
        SYSTEM_USER
    FROM inserted i
    JOIN deleted d ON d.usuario = i.usuario
    WHERE ISNULL(d.nombre_completo,'') <> ISNULL(i.nombre_completo,'');

    -- Correo cambiado
    INSERT INTO Log_Usuario (usuario_id, accion, campo_modificado, valor_anterior, valor_nuevo, realizado_por)
    SELECT 
        i.usuario,
        'UPDATE',
        'correo_electronico',
        d.correo_electronico,
        i.correo_electronico,
        SYSTEM_USER
    FROM inserted i
    JOIN deleted d ON d.usuario = i.usuario
    WHERE ISNULL(d.correo_electronico,'') <> ISNULL(i.correo_electronico,'');

    -- Contraseña cambiada
    INSERT INTO Log_Usuario (usuario_id, accion, campo_modificado, valor_anterior, valor_nuevo, realizado_por)
    SELECT 
        i.usuario,
        'UPDATE',
        'contrasena',
        d.contrasena,
        i.contrasena,
        SYSTEM_USER
    FROM inserted i
    JOIN deleted d ON d.usuario = i.usuario
    WHERE ISNULL(d.contrasena,'') <> ISNULL(i.contrasena,'');

    -- Fecha última actualización cambiada
    INSERT INTO Log_Usuario (usuario_id, accion, campo_modificado, valor_anterior, valor_nuevo, realizado_por)
    SELECT 
        i.usuario,
        'UPDATE',
        'fecha_ultima_actualizacion',
        CONVERT(VARCHAR, d.fecha_ultima_actualizacion, 120),
        CONVERT(VARCHAR, i.fecha_ultima_actualizacion, 120),
        SYSTEM_USER
    FROM inserted i
    JOIN deleted d ON d.usuario = i.usuario
    WHERE d.fecha_ultima_actualizacion <> i.fecha_ultima_actualizacion;
END;

CREATE TRIGGER trg_log_usuario_delete
ON usuario
AFTER DELETE
AS
BEGIN
    INSERT INTO Log_Usuario (usuario_id, accion, campo_modificado, valor_anterior, valor_nuevo, fecha_log, realizado_por)
    SELECT 
        d.usuario,
        'DELETE',
        NULL,
        CONCAT('Nombre: ', d.nombre_completo, 
               ', Correo: ', d.correo_electronico,
               ', Fecha Registro: ', CONVERT(VARCHAR, d.fecha_registro, 120)),
        NULL,
        GETDATE(),
        SYSTEM_USER
    FROM deleted d;
END;
