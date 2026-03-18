## 📌 Propuesta de Solución

Se propone una solución basada en:

- React Native (frontend móvil)
- Node.js + Express (backend)
- lenguaje que vamos  a usar: JavaScript/TypeScript
- MySQL (base de datos)
- IA para reconocimiento de señas

Con una **arquitectura en n capas**:
## 📚 Estructura de capas

### 1. Capa de presentación
- Aplicación móvil (React Native)
- Interfaz de usuario
- Captura de datos (cámara, inputs)

### 2. Capa de lógica de negocio
- Procesamiento de traducciones
- Gestión de usuarios
- Manejo de historial
- Estadísticas

### 3. Capa de acceso a datos
- Conexión con base de datos
- Consultas (CRUD)
- Persistencia de información

### 4. Capa de servicios externos
- Módulo de IA
- Almacenamiento de archivos
- Servicios externos (auth, notificaciones)
  
organizada como un **monolito modular**, lo que permite:

- desarrollo ágil  
- buena organización  
- escalabilidad  
- fácil mantenimiento  