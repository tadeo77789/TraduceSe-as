
CREATE OR ALTER PROCEDURE datosinsertados
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @sql NVARCHAR(MAX);

    SET @sql = '
    WITH numeros AS (
    SELECT TOP 50 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.objects
)
INSERT INTO usuario (usuario, nombre_completo, correo_electronico, contrasena, fecha_registro, fecha_ultima_actualizacion)
SELECT 
    n AS usuario,
    CONCAT(''Usuario Prueba '', n),
    CONCAT(''usuario'', n, ''@example.com''),
    CONCAT(''pass'', n),
    DATEADD(DAY, -n, GETDATE()),
    GETDATE()
FROM numeros;

WITH numeros AS (
    SELECT TOP 100 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.objects
)
INSERT INTO traduccion (id_traduccion, id_usuario, tipo_traduccion, contenido_origen, contenido_traducido, fecha_hora)
SELECT
    n AS id_traduccion,
    (n % 50) + 1 AS id_usuario,  -- usuarios del 1 al 50
    CASE WHEN n % 2 = 0 THEN ''Texto a Señas'' ELSE ''Audio a Señas'' END,
    CONCAT(''Contenido de prueba número '', n),
    CONCAT(''Video_traduccion_'', n, ''.mp4''),
    DATEADD(MINUTE, n, GETDATE())
FROM numeros;

WITH numeros AS (
    SELECT TOP 50 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.objects
)
INSERT INTO EstadisticasUso (id_estadistica, id_usuario, tipo_evento, valor, fecha_evento)
SELECT
    n AS id_estadistica,
    (n % 50) + 1 AS id_usuario,
    CASE 
        WHEN n % 3 = 0 THEN ''traducciones_realizadas''
        WHEN n % 3 = 1 THEN ''videos_vistos''
        ELSE ''accesos''
    END AS tipo_evento,
    (n % 7) + 1,
    DATEADD(HOUR, -n, GETDATE())
FROM numeros;

WITH numeros AS (
    SELECT TOP 50 ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.objects
)
INSERT INTO Alarmas (id_alarma, id_usuario, nombre_evento, fecha_hora_alarma, activa)
SELECT
    n AS id_alarma,
    (n % 50) + 1,
    CONCAT(''Evento programado '', n),
    DATEADD(DAY, n, GETDATE()),
    CASE WHEN n % 2 = 0 THEN 1 ELSE 0 END
FROM numeros;

WITH letras AS (
    SELECT 1 AS id, ''A'' AS letra UNION ALL SELECT 2,''B'' UNION ALL SELECT 3,''C''
    UNION ALL SELECT 4,''D'' UNION ALL SELECT 5,''E'' UNION ALL SELECT 6,''F''
    UNION ALL SELECT 7,''G'' UNION ALL SELECT 8,''H'' UNION ALL SELECT 9,''I''
    UNION ALL SELECT 10,''J'' UNION ALL SELECT 11,''K'' UNION ALL SELECT 12,''L''
    UNION ALL SELECT 13,''M'' UNION ALL SELECT 14,''N'' UNION ALL SELECT 15,''O''
    UNION ALL SELECT 16,''P'' UNION ALL SELECT 17,''Q'' UNION ALL SELECT 18,''R''
    UNION ALL SELECT 19,''S'' UNION ALL SELECT 20,''T'' UNION ALL SELECT 21,''U''
    UNION ALL SELECT 22,''V'' UNION ALL SELECT 23,''W'' UNION ALL SELECT 24,''X''
    UNION ALL SELECT 25,''Y'' UNION ALL SELECT 26,''Z''
)
INSERT INTO LexicoSenas (id_sena, id_usuario, palabra_letra, descripcion, categoria)
SELECT
    id_sena = 1000 + id,
    id_usuario = (id % 50) + 1,
    letra,
    CONCAT(''Representación en señas de la letra '', letra),
    ''Abecedario''
FROM letras;

WITH letras AS (
    SELECT 1 AS id, ''A'' AS letra UNION ALL SELECT 2,''B'' UNION ALL SELECT 3,''C''
    UNION ALL SELECT 4,''D'' UNION ALL SELECT 5,''E'' UNION ALL SELECT 6,''F''
    UNION ALL SELECT 7,''G'' UNION ALL SELECT 8,''H'' UNION ALL SELECT 9,''I''
    UNION ALL SELECT 10,''J'' UNION ALL SELECT 11,''K'' UNION ALL SELECT 12,''L''
    UNION ALL SELECT 13,''M'' UNION ALL SELECT 14,''N'' UNION ALL SELECT 15,''O''
    UNION ALL SELECT 16,''P'' UNION ALL SELECT 17,''Q'' UNION ALL SELECT 18,''R''
    UNION ALL SELECT 19,''S'' UNION ALL SELECT 20,''T'' UNION ALL SELECT 21,''U''
    UNION ALL SELECT 22,''V'' UNION ALL SELECT 23,''W'' UNION ALL SELECT 24,''X''
    UNION ALL SELECT 25,''Y'' UNION ALL SELECT 26,''Z''
)
INSERT INTO RecursosMultimedia (id_recursos, id_sena, tipo_recurso, url_recurso)
SELECT
    id_recursos = 2000 + id,
    id_sena = 1000 + id,
    CASE WHEN id % 2 = 0 THEN ''imagen'' ELSE ''video'' END AS tipo_recurso,
    CASE WHEN id % 2 = 0 
         THEN CONCAT(''https://example.com/abecedario/'', letra, ''.png'')
         ELSE CONCAT(''https://example.com/abecedario/'', letra, ''.mp4'') 
    END
FROM letras;


    ';

    EXEC sp_executesql @sql;
END
GO