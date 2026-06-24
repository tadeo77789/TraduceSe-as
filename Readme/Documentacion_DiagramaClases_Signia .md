# PROYECTO SIGNIA — Traduce Señas
## Documentación del Diagrama de Clases

> **Patrones de Diseño:** Singleton · Factory Method · Observer · Command
>
> **SENA — Análisis y Desarrollo de Software · 2025**

---

## 1. Introducción

Este documento describe en detalle el Diagrama de Clases UML del sistema Signia, una aplicación móvil para la traducción en tiempo real de la lengua de señas colombiana. Se explica cada clase, sus atributos, sus métodos y las relaciones que mantiene con otras clases del sistema.

El diagrama está organizado en cinco secciones principales según el rol de cada elemento:

- **Patrón Singleton:** clases con instancia única global.
- **Patrón Factory Method:** fábricas de objetos de traducción y notificación.
- **Patrón Observer:** gestión reactiva de eventos del sistema.
- **Patrón Command:** encapsulamiento de acciones de perfil con soporte de deshacer.
- **Dominio:** entidades principales del negocio.

---

## 2. Patrón Singleton

El patrón Singleton garantiza que una clase tenga una única instancia en toda la aplicación y proporciona un punto de acceso global a ella. En Signia se aplica a dos clases críticas que deben existir una sola vez: la conexión a la base de datos y la configuración global de la app.

---

### 2.1 DatabaseConnection

Gestiona la única conexión activa a la base de datos MySQL del sistema. Al ser Singleton, evita que múltiples módulos abran conexiones duplicadas, ahorrando recursos y previniendo inconsistencias.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `instance` | Referencia estática a la única instancia de la clase. Es privada para que nadie pueda reemplazarla desde afuera. |
| `connection` | Objeto de conexión activa a la base de datos. Contiene los parámetros de host, puerto, credenciales y nombre de BD. |
| **▶ Métodos** | |
| `DatabaseConnection()` | Constructor privado. Impide que otras clases puedan instanciar la conexión directamente con "new". |
| `getInstance()` | Método estático público. Retorna la instancia existente o la crea si aún no existe. Es el único punto de acceso. |
| `getConnection()` | Retorna el objeto de conexión para que los repositorios puedan ejecutar consultas. |
| `disconnect()` | Cierra la conexión activa de forma segura al apagar la aplicación o en caso de error crítico. |

---

### 2.2 ConfiguracionApp

Almacena las preferencias globales de la aplicación como idioma y tema visual. Al ser Singleton, cualquier módulo que consulte el idioma o el tema obtiene siempre el mismo valor actualizado.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `instance` | Referencia estática a la única instancia de configuración. |
| `idioma` | Código del idioma activo en la app (ej: "es" para español, "en" para inglés). |
| `tema` | Tema visual activo: "claro" u "oscuro". |
| **▶ Métodos** | |
| `ConfiguracionApp()` | Constructor privado que inicializa la configuración con valores por defecto. |
| `getInstance()` | Retorna la única instancia de configuración. La crea en la primera llamada. |
| `getIdioma()` | Retorna el idioma actualmente configurado en la aplicación. |
| `getTema()` | Retorna el tema visual actualmente activo. |
| `setIdioma(idioma)` | Actualiza el idioma global de la app. Todos los módulos que la consulten verán el cambio inmediatamente. |
| `setTema(tema)` | Cambia el tema visual global entre claro y oscuro. |

---

## 3. Patrón Factory Method

El patrón Factory Method define una interfaz para crear objetos, pero delega a las subclases la decisión de qué clase concreta instanciar. En Signia se aplica en dos familias de objetos: las traducciones (según su tipo) y las notificaciones (según su canal).

---

### 3.1 TraduccionFactory *(abstracta)*

Clase base abstracta que define el contrato para crear cualquier tipo de traducción. Cada subclase concreta decide qué tipo de objeto Traduccion construir.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `crearTraduccion()` | Método abstracto. Cada fábrica concreta lo implementa para construir su tipo específico de Traduccion. |
| `procesarTraduccion()` | Método plantilla que llama a crearTraduccion() internamente y aplica lógica común a todos los tipos (logging, validación, auditoría). |

---

### 3.2 TraduccionTextoSenaFactory

Fábrica concreta que crea objetos Traduccion del tipo texto → seña. Se activa cuando el usuario escribe texto y quiere verlo representado en lengua de señas mediante el avatar 3D.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `crearTraduccion()` | Instancia una Traduccion con tipo="texto_sena", prepara el texto de entrada y lo conecta con el motor de animación 3D. |

---

### 3.3 TraduccionSenaTextoFactory

Fábrica concreta que crea objetos Traduccion del tipo seña → texto. Se activa cuando la cámara captura gestos y el modelo de IA los convierte a texto escrito.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `crearTraduccion()` | Instancia una Traduccion con tipo="sena_texto", recibe el frame de la cámara y lo conecta con el módulo de visión por computadora. |

---

### 3.4 TraduccionVozSenaFactory

Fábrica concreta para traducciones de voz → seña. El usuario habla y el sistema convierte el audio a texto primero, y luego a representación de señas.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `crearTraduccion()` | Instancia una Traduccion con tipo="voz_sena", recibe el audio procesado y lo prepara para la animación de señas. |

---

### 3.5 NotificacionFactory *(abstracta)*

Clase base abstracta para crear notificaciones. Define el contrato común independientemente del canal por el que se entregue la notificación al usuario.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `crearNotificacion()` | Método abstracto. Retorna un objeto que implementa INotificacion. |
| `enviarNotificacion()` | Método plantilla que llama a crearNotificacion() y ejecuta el envío de forma unificada. |

---

### 3.6 NotificacionPushFactory

Crea notificaciones push que se envían al dispositivo móvil del usuario a través del token FCM/APNs registrado en DispositivoUsuario.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `crearNotificacion()` | Instancia un NotificacionObserver listo para enviarse como notificación push al dispositivo registrado. |

---

### 3.7 INotificacion *(interfaz producto)*

Interfaz compartida entre los patrones Factory Method y Observer. Define el contrato mínimo que debe cumplir cualquier objeto notificable, independientemente de su tipo concreto.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `enviar()` | Ejecuta el envío de la notificación por el canal correspondiente (push, visual, sonido). |
| `cancelar()` | Cancela o descarta la notificación antes de que sea procesada o mostrada. |

---

## 4. Patrón Observer

El patrón Observer establece una dependencia uno-a-muchos entre objetos, de forma que cuando el objeto central (observable) cambia de estado, todos sus suscriptores (observers) son notificados automáticamente. En Signia, el GestorEventos actúa como observable y reacciona a eventos como nuevas traducciones, acciones del usuario o cambios de sesión.

---

### 4.1 IObservable *(interfaz)*

Define el contrato que debe implementar cualquier clase que quiera actuar como fuente de eventos en el sistema.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `suscribir(observer)` | Registra un nuevo observer para que reciba notificaciones de eventos. |
| `desuscribir(observer)` | Elimina un observer de la lista, dejando de enviarle notificaciones. |
| `notificar(evento, datos)` | Recorre la lista de observers y llama al método actualizar() de cada uno. |

---

### 4.2 IObserver *(interfaz)*

Define el contrato mínimo que debe cumplir cualquier clase que quiera recibir eventos del sistema.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `actualizar(evento, datos)` | Método invocado por el GestorEventos cuando ocurre un evento. Recibe el nombre del evento y un objeto con los datos relevantes. |

---

### 4.3 GestorEventos

Clase central del patrón Observer. Actúa como el núcleo de comunicación reactiva del sistema. Cuando ocurre un evento (nueva traducción, login de usuario, etc.), este gestor notifica a todos los observers suscritos.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `observadores` | Lista de todos los observers actualmente suscritos que recibirán las notificaciones de eventos. |
| **▶ Métodos** | |
| `suscribir(observer)` | Agrega un observer a la lista interna. |
| `desuscribir(observer)` | Remueve un observer de la lista. |
| `notificar(evento, datos)` | Itera sobre todos los observers y llama a su método actualizar(). |
| `emitirEvento(evento, datos)` | Punto de entrada público para disparar un evento desde cualquier parte del sistema. Internamente llama a notificar(). |

---

### 4.4 NotificacionObserver

Observer que gestiona las notificaciones push del sistema. Cuando ocurre un evento relevante, este observer crea y envía la notificación al dispositivo del usuario.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único de la notificación. |
| `titulo` | Título corto de la notificación que aparece en la barra de notificaciones del dispositivo. |
| `cuerpo` | Texto completo del mensaje de la notificación. |
| `leida` | Indica si el usuario ya vio la notificación (true) o aún está pendiente (false). |
| `created_at` | Fecha y hora exacta en que se generó la notificación. |
| **▶ Métodos** | |
| `actualizar(evento, datos)` | Recibe el evento del GestorEventos y decide si debe generar una notificación según el tipo de evento. |
| `enviar()` | Envía la notificación push al dispositivo mediante el token registrado. |
| `cancelar()` | Descarta la notificación antes de enviarla. |
| `marcarLeida()` | Actualiza el atributo leida a true cuando el usuario toca la notificación. |

---

### 4.5 EventoUsoObserver

Observer que registra estadísticas de uso de la aplicación. Cada vez que el usuario navega a una sección o realiza una acción, este observer guarda la información para generar reportes de uso (RF6 del SRS).

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del evento registrado. |
| `seccion` | Nombre de la sección de la app donde ocurrió el evento (ej: "Traducción", "Léxico", "Perfil"). |
| `accion` | Descripción de la acción realizada (ej: "traducir", "buscar_palabra", "cambiar_tema"). |
| `duracion_seg` | Tiempo en segundos que el usuario estuvo en esa sección o tardó en completar la acción. |
| `created_at` | Marca de tiempo del momento en que ocurrió el evento. |
| **▶ Métodos** | |
| `actualizar(evento, datos)` | Recibe el evento del GestorEventos y extrae los datos relevantes para el registro de estadísticas. |
| `registrarEvento()` | Persiste el evento en la base de datos para su posterior análisis en el módulo de estadísticas. |

---

## 5. Patrón Command

El patrón Command encapsula una acción como un objeto, lo que permite parametrizar operaciones, almacenarlas en un historial y ejecutar la operación inversa (deshacer). En Signia se aplica a las acciones de configuración del perfil del usuario, donde tiene sentido permitir al usuario revertir cambios accidentales.

---

### 5.1 ICommand *(interfaz)*

Define el contrato que debe cumplir cualquier comando del sistema, garantizando que siempre exista una forma de ejecutar y de deshacer la acción.

| Nombre | Descripción |
|---|---|
| **▶ Métodos** | |
| `ejecutar()` | Realiza la acción encapsulada por el comando (cambiar idioma, tema o contraseña). |
| `deshacer()` | Revierte la acción realizada, restaurando el estado anterior del objeto afectado. |

---

### 5.2 InvokerPerfil

Invocador que gestiona la ejecución y el historial de comandos de perfil. Actúa como intermediario entre la interfaz de usuario y los comandos concretos, manteniendo la pila de acciones realizadas.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `historial` | Lista ordenada de los comandos ejecutados. Permite deshacer operaciones en orden inverso (último en entrar, primero en salir). |
| **▶ Métodos** | |
| `ejecutarComando(cmd)` | Recibe un comando, lo ejecuta y lo agrega al historial. |
| `deshacerUltimo()` | Extrae el último comando del historial y llama a su método deshacer(). |
| `limpiarHistorial()` | Vacía el historial de comandos, por ejemplo al cerrar sesión. |

---

### 5.3 ComandoCambiarIdioma

Encapsula el cambio de idioma de la aplicación. Guarda el idioma anterior para poder revertirlo si el usuario se equivoca.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `usuario` | Referencia al usuario cuyo idioma se va a cambiar. |
| `idiomaAnterior` | Valor del idioma antes del cambio, usado para deshacer. |
| `idiomaNuevo` | Valor del nuevo idioma que se aplicará al ejecutar el comando. |
| **▶ Métodos** | |
| `ejecutar()` | Aplica el nuevo idioma al usuario y actualiza ConfiguracionApp. |
| `deshacer()` | Restaura el idioma anterior, revirtiendo el cambio. |

---

### 5.4 ComandoCambiarTema

Encapsula el cambio de tema visual (claro/oscuro). Permite deshacer el cambio si el usuario no queda conforme.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `usuario` | Referencia al usuario afectado. |
| `temaAnterior` | Tema visual antes del cambio. |
| `temaNuevo` | Tema visual que se aplicará. |
| **▶ Métodos** | |
| `ejecutar()` | Cambia el tema del usuario y actualiza ConfiguracionApp. |
| `deshacer()` | Restaura el tema anterior. |

---

### 5.5 ComandoCambiarPassword

Encapsula el cambio de contraseña del usuario. El deshacer consiste en restablecer el hash anterior de la contraseña.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `usuario` | Referencia al usuario que cambia su contraseña. |
| `passwordHash` | Hash de la contraseña anterior, necesario para restaurarla si se deshace la operación. |
| **▶ Métodos** | |
| `ejecutar()` | Aplica el nuevo hash de contraseña al perfil del usuario. |
| `deshacer()` | Restaura el hash anterior de la contraseña. |

---

## 6. Capa de Dominio

Las clases de dominio representan las entidades principales del negocio del sistema Signia. Son independientes de los patrones de diseño y modelan directamente los conceptos del mundo real que el sistema debe gestionar.

---

### 6.1 Usuario

Entidad central del sistema. Representa a cualquier persona que utiliza la aplicación, ya sea oyente o persona sorda. Toda la información personal y de configuración del usuario se almacena aquí.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del usuario en el sistema. |
| `nombre` | Nombre completo del usuario. |
| `edad` | Edad del usuario, usada para personalizar la experiencia. |
| `email` | Correo electrónico único, utilizado como identificador de inicio de sesión. |
| `password` | Hash de la contraseña del usuario. Nunca se almacena en texto plano. |
| `tema` | Preferencia visual: true para tema oscuro, false para tema claro. |
| `idioma` | Idioma preferido del usuario para la interfaz de la aplicación. |
| `terminos_aceptado` | Indica si el usuario aceptó los términos y condiciones (requerido para usar la app). |
| `fecha_terminos` | Fecha y hora en que el usuario aceptó los términos. |
| **▶ Métodos** | |
| `registrar()` | Crea una nueva cuenta de usuario validando que el email no exista previamente. |
| `login()` | Autentica al usuario verificando email y contraseña, iniciando la sesión. |
| `logout()` | Cierra la sesión activa del usuario de forma segura. |
| `actualizarPerfil()` | Permite modificar nombre, edad y otras preferencias del perfil. |
| `cambiarPassword()` | Actualiza la contraseña previa verificación de la contraseña actual. |

---

### 6.2 Traduccion

Representa cada acto de traducción realizado en la app. Es el objeto producto creado por las fábricas de TraduccionFactory.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único de la traducción. |
| `texto_entrada` | El texto original ingresado por el usuario o reconocido por la IA. |
| `texto_traducido` | El resultado de la traducción (texto a mostrar o instrucciones para el avatar 3D). |
| `tipo` | Tipo de traducción: "texto_sena", "sena_texto" o "voz_sena". |
| `fecha_traduccion` | Marca de tiempo del momento exacto en que se realizó la traducción. |
| `is_deleted` | Borrado lógico. Si es true, la traducción no aparece en el historial pero se conserva en BD. |
| **▶ Métodos** | |
| `guardarTraduccion()` | Persiste la traducción en la base de datos y la agrega al historial del usuario. |
| `eliminarTraduccion()` | Realiza un borrado lógico (is_deleted = true) sin eliminar el registro de la base de datos. |

---

### 6.3 LexicoSenas

Catálogo de palabras y señas del sistema. Almacena cada palabra o letra del alfabeto de la lengua de señas colombiana junto con su descripción y los recursos multimedia asociados.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del término en el léxico. |
| `palabra` | Texto de la palabra o frase que representa esta seña. |
| `descripcion` | Explicación de cómo se realiza la seña físicamente. |
| `tipo` | Categoría del término: "palabra", "frase", "numero" o "letra". |
| `letra` | Si el tipo es "letra", almacena el carácter específico del alfabeto dactilológico. |
| `idioma` | Idioma de la lengua de señas: "LSC" (Lengua de Señas Colombiana) u otras. |
| **▶ Métodos** | |
| `buscarPalabra()` | Busca términos en el léxico por texto, tipo o idioma. |
| `agregarPalabra()` | Agrega un nuevo término al catálogo de señas (función administrativa). |
| `eliminarPalabra()` | Elimina un término del léxico (función administrativa). |

---

### 6.4 RecursosMultimedia

Almacena los archivos de video e imagen asociados a cada entrada del léxico de señas. Un mismo término puede tener múltiples recursos ordenados para mostrar la seña desde distintos ángulos.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del recurso. |
| `tipo` | Tipo de archivo: "video", "imagen" o "gif". |
| `url` | URL de acceso al archivo almacenado en el servicio de almacenamiento en la nube. |
| `mime_type` | Tipo MIME del archivo (ej: "video/mp4", "image/png") para renderizarlo correctamente. |
| `orden` | Número de orden para mostrar los recursos de un mismo término en secuencia correcta. |
| **▶ Métodos** | |
| `agregarRecurso()` | Sube y registra un nuevo archivo multimedia asociado a un término del léxico. |
| `eliminarRecurso()` | Elimina el registro del recurso y el archivo del almacenamiento. |

---

### 6.5 DispositivoUsuario

Registra los dispositivos móviles desde los cuales el usuario ha iniciado sesión. Es fundamental para el envío de notificaciones push, ya que cada dispositivo tiene un token único.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del registro de dispositivo. |
| `token_push` | Token FCM (Android) o APNs (iOS) del dispositivo, necesario para enviar notificaciones push. |
| `plataforma` | Sistema operativo del dispositivo: "android" o "ios". |
| `activo` | Indica si el dispositivo sigue activo para recibir notificaciones (false si el usuario cerró sesión). |
| **▶ Métodos** | |
| `registrar()` | Registra un nuevo dispositivo o actualiza el token push si el dispositivo ya existe. |
| `activar()` | Marca el dispositivo como activo para recibir notificaciones. |
| `revocar()` | Desactiva el dispositivo al cerrar sesión, evitando que reciba notificaciones. |

---

### 6.6 AuditoriaAccion

Registra todos los cambios importantes realizados en el sistema. Cumple con requisitos de trazabilidad y permite recuperar información ante errores o comportamientos inesperados.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del registro de auditoría. |
| `tabla_afectada` | Nombre de la tabla de base de datos que fue modificada (ej: "usuarios", "traducciones"). |
| `accion` | Tipo de operación realizada: "INSERT", "UPDATE" o "DELETE". |
| `datos_anteriores` | Snapshot en JSON del estado del registro antes del cambio. |
| `datos_nuevos` | Snapshot en JSON del estado del registro después del cambio. |
| `created_at` | Fecha y hora exacta en que ocurrió el cambio. |
| **▶ Métodos** | |
| `registrarCambio()` | Crea un nuevo registro de auditoría con los datos del antes y después de la operación. |

---

### 6.7 SeccionUso

Registra el tiempo que el usuario pasa en cada sesión de la aplicación. Alimenta las estadísticas de uso (RF6) y permite analizar qué funcionalidades son más utilizadas.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único de la sesión de uso. |
| `inicio` | Timestamp del momento en que el usuario abrió la aplicación. |
| `fin` | Timestamp del momento en que el usuario cerró o minimizó la aplicación. |
| `duracion_seg` | Duración total de la sesión en segundos, calculada como fin - inicio. |
| **▶ Métodos** | |
| `iniciarSesion()` | Registra el timestamp de inicio cuando el usuario abre la app. |
| `cerrarSesion()` | Registra el timestamp de fin cuando el usuario sale de la app. |
| `calcularDuracion()` | Calcula y guarda la diferencia en segundos entre inicio y fin. |

---

### 6.8 PasswordResetToken

Gestiona los tokens temporales para recuperación de contraseña. Cuando el usuario solicita restablecer su contraseña, se genera un token con tiempo de expiración que se envía a su correo.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del token. |
| `token_hash` | Hash del token enviado al correo del usuario. Se almacena hasheado por seguridad. |
| `expires_at` | Fecha y hora de expiración del token (generalmente 15-60 minutos desde su creación). |
| `used_at` | Fecha y hora en que el token fue utilizado. Si tiene valor, el token ya fue consumido y no puede reusarse. |
| **▶ Métodos** | |
| `generarToken()` | Crea un nuevo token aleatorio, lo hashea y establece su fecha de expiración. |
| `validarToken()` | Verifica que el token no haya expirado y no haya sido usado previamente. |
| `usarToken()` | Marca el token como utilizado registrando la fecha en used_at, invalidándolo para futuros usos. |

---

### 6.9 UsuarioAuth

Gestiona la autenticación a través de proveedores externos como Google o Facebook (OAuth). Permite que el usuario inicie sesión con su cuenta de redes sociales sin necesidad de crear una contraseña nueva.

| Nombre | Descripción |
|---|---|
| **⚙ Atributos** | |
| `id` | Identificador único del registro de autenticación externa. |
| `proveedor` | Nombre del proveedor OAuth utilizado: "google", "facebook" o "apple". |
| `provider_id` | ID único del usuario en el sistema del proveedor externo. |
| `email_provider` | Email asociado a la cuenta del proveedor externo. |
| **▶ Métodos** | |
| `autenticar()` | Verifica las credenciales del proveedor OAuth y vincula o crea la cuenta del usuario en Signia. |
| `vincularProveedor()` | Asocia un proveedor externo a una cuenta de Signia ya existente. |

---

## 7. Relaciones entre Clases

La siguiente tabla resume todas las relaciones de asociación definidas en el diagrama, con su multiplicidad y significado.

| Clase A | Multiplicidad | Clase B | Descripción |
|---|---|---|---|
| `Usuario` | 1 — 0..* | `Traduccion` | Un usuario puede tener cero o muchas traducciones en su historial. |
| `Usuario` | 1 — 0..* | `DispositivoUsuario` | Un usuario puede tener registrados varios dispositivos móviles. |
| `Usuario` | 1 — 0..* | `SeccionUso` | Se registra cada sesión de uso del usuario en la app. |
| `Usuario` | 1 — 0..* | `AuditoriaAccion` | Cada acción importante del usuario queda registrada en auditoría. |
| `Usuario` | 1 — 0..1 | `PasswordResetToken` | El usuario puede tener como máximo un token de reset activo a la vez. |
| `Usuario` | 1 — 0..1 | `UsuarioAuth` | El usuario puede tener vinculada opcionalmente una cuenta OAuth. |
| `LexicoSenas` | 1 — 0..* | `RecursosMultimedia` | Cada seña del léxico puede tener múltiples videos e imágenes. |
| `DispositivoUsuario` | 1 — 0..* | `NotificacionObserver` | Un dispositivo puede recibir múltiples notificaciones push. |
| `TraduccionFactory` | crea → | `Traduccion` | Las tres fábricas concretas producen objetos Traduccion de distintos tipos. |
| `NotificacionPushFactory` | crea → | `NotificacionObserver` | Esta fábrica produce notificaciones push listas para enviarse. |
| `GestorEventos` | 1 → 0..* | `IObserver` | El gestor notifica a todos sus observers cuando ocurre un evento. |
| `InvokerPerfil` | invoca → | `ICommand` | El invocador ejecuta y deshace los comandos de perfil según el historial. |
| `ICommand` | modifica → | `Usuario` | Los tres comandos concretos modifican atributos del objeto Usuario. |

---

## 8. Resumen de Patrones y su Justificación

| Patrón | Clases principales | Problema que resuelve | Beneficio en Signia |
|---|---|---|---|
| **Singleton** | `DatabaseConnection`, `ConfiguracionApp` | Múltiples instancias de conexión o configuración inconsistente | Una sola conexión a BD y un único estado de configuración en toda la app |
| **Factory Method** | `TraduccionFactory`, `NotificacionFactory` | Crear objetos de tipos distintos sin acoplar el código cliente al tipo concreto | Agregar nuevos tipos de traducción o notificación sin modificar el código existente |
| **Observer** | `GestorEventos` + 2 observers | Propagar eventos del sistema a múltiples destinos sin acoplamiento directo | Notificaciones y estadísticas reaccionan automáticamente a eventos de traducción y navegación |
| **Command** | `InvokerPerfil` + 3 comandos | Acciones de perfil sin historial ni posibilidad de deshacer | El usuario puede revertir cambios accidentales de idioma, tema o contraseña |

---

*— Fin del documento —*
