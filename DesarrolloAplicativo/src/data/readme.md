# data — Capa de Acceso a Datos

Contiene la lógica de comunicación con el backend (llamadas HTTP) y el almacenamiento local del dispositivo.

## Propósito

Esta capa abstrae el origen de los datos. Las pantallas y casos de uso no necesitan saber si los datos vienen de la API, del caché o del almacenamiento local.

## Archivos esperados

| Archivo | Descripción |
|---|---|
| `api/translationApi.ts` | Funciones para enviar texto/audio/imágenes al backend y recibir la traducción |
| `api/authApi.ts` | Peticiones HTTP de login, registro y recuperación de contraseña |
| `api/lexiconApi.ts` | Búsqueda de palabras y señas en el catálogo LSC |
| `api/statsApi.ts` | Obtención de datos de estadísticas de uso |
| `local/storageService.ts` | Acceso a `AsyncStorage` para guardar token, preferencias y caché |

## Tecnologías utilizadas

- **axios**: cliente HTTP para las peticiones al backend
- **AsyncStorage** (`@react-native-async-storage/async-storage`): almacenamiento local persistente en el dispositivo
- **expo-secure-store**: almacenamiento seguro del token de autenticación
