
INSERT INTO usuario (usuario, nombre_completo, correo_electronico, contrasena, fecha_registro, fecha_ultima_actualizacion)
VALUES 
(1, 'Juan suaza', 'juanp@example.com', '12345', NOW()(), NOW()()),
(2, 'María garcia', 'maria.g@example.com', 'abcde', NOW()(), NOW()());

INSERT INTO traduccion (id_traduccion, id_usuario, tipo_traduccion, contenido_origen, contenido_traducido, fecha_hora)
VALUES 
(101, 1, 'Texto a Señas', 'Hola, ¿cómo estás?', 'Video_Senas_001.mp4', NOW()()),
(102, 2, 'Audio a Señas', 'Buenos días', 'Video_Senas_002.mp4', NOW()());

INSERT INTO EstadisticasUso (id_estadistica, id_usuario, tipo_evento, valor, fecha_evento)
VALUES
(1, 1, 'traducciones_realizadas', 1, NOW()()),
(2, 1, 'videos_vistos', 4, NOW()()),
(3, 2, 'traducciones_realizadas', 3, NOW()());

INSERT INTO Alarmas (id_alarma, id_usuario, nombre_evento, fecha_hora_alarma, activa)
VALUES
(10, 1, 'Recordatorio práctica', '2025-11-20 09:00:00', 1),
(11, 2, 'Revisión de traducciones', '2025-11-22 15:00:00', 0);

INSERT INTO LexicoSenas (id_sena, id_usuario, palabra_letra, descripcion, categoria)
VALUES
(500, 1, 'Hola', 'Saludo inicial en lengua de señas', 'Saludo'),
(501, 2, 'Gracias', 'Expresión de agradecimiento', 'Cortesía');

INSERT INTO RecursosMultimedia (id_recursos, id_sena, tipo_recurso, url_recurso)
VALUES
(900, 500, 'video', 'https://example.com/videos/hola.mp4'),
(901, 501, 'imagen', 'https://example.com/imagenes/gracias.png');



UPDATE usuario
SET nombre_completo = 'Juan David Pérez', fecha_ultima_actualizacion = NOW()()
WHERE usuario = 1;

UPDATE Alarmas
SET activa = 0
WHERE id_alarma = 10;

UPDATE LexicoSenas
SET descripcion = 'Seña utilizada para expresar agradecimiento'
WHERE id_sena = 501;



DELETE FROM RecursosMultimedia
WHERE id_recursos = 900;

DELETE FROM Alarmas
WHERE id_alarma = 11;

DELETE FROM EstadisticasUso
WHERE id_usuario = 2;



SELECT * FROM traduccion
WHERE id_usuario = 1;

SELECT tipo_evento, valor, fecha_evento
FROM EstadisticasUso
ORDER BY fecha_evento DESC;

SELECT * FROM Alarmas
WHERE activa = 1;

SELECT L.palabra_letra, L.categoria, R.tipo_recurso, R.url_recurso
FROM LexicoSenas L
JOIN RecursosMultimedia R ON L.id_sena = R.id_sena;
