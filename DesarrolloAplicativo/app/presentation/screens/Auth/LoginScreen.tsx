// Archivo: app/presentation/screens/Auth/LoginScreen.tsx
/**
 * @file LoginScreen.tsx
 * @description Pantalla de inicio de sesión.
 *
 * Usa `useLoginForm` para manejar el estado, la validación y el submit.
 * Soporta dos layouts:
 * - **Web (≥ 768 px)**: panel imagen a la izquierda + formulario a la derecha.
 * - **Móvil**: formulario a pantalla completa con fondo lavanda.
 *
 * Incluye campos de correo y contraseña, link a "Olvidé mi contraseña",
 * botones de acceso social (Google y Facebook — pendiente integración) y
 * link de navegación a la pantalla de registro.
 */
import React from 'react'; // Importa React desde 'react', necesario para usar JSX
import {
  View, // Contenedor genérico tipo caja para agrupar elementos
  Text, // Componente para mostrar texto en pantalla
  StyleSheet, // Utilidad para crear hojas de estilos optimizadas
  TouchableOpacity, // Botón táctil con efecto de opacidad al presionar
  ScrollView, // Contenedor con scroll para cuando el contenido supera la pantalla
  KeyboardAvoidingView, // Contenedor que sube el contenido cuando aparece el teclado
  Platform, // Utilidad para detectar el sistema operativo (ios, android, web)
  Image, // Componente para mostrar imágenes locales o remotas
  useWindowDimensions, // Hook que devuelve el ancho y alto actual de la ventana
} from 'react-native'; // Todos los anteriores provienen del paquete principal 'react-native'
import { useNavigation } from '@react-navigation/native'; // Hook para acceder al objeto de navegación entre pantallas
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Hook que devuelve los insets del área segura (notch, barra de estado)
import { Ionicons } from '@expo/vector-icons'; // Librería de iconos vectoriales de Expo
import { Colors } from '../../../constants/colors'; // Paleta de colores centralizada — ruta: app/constants/colors.ts
import { Input } from '../../components/common/Input'; // Componente reutilizable de campo de texto con íconos y errores — ruta: app/presentation/components/common/Input.tsx
import { useLoginForm } from '../../../hooks/useLoginForm'; // Hook personalizado con la lógica del formulario de login (estado, validación, submit) — ruta: app/hooks/useLoginForm.ts
import { useTranslation } from '../../../i18n';

// Logo oficial de Google (SVG multicolor) como data URI — sólo funciona en web
const GOOGLE_LOGO_URI = `data:image/svg+xml;utf8,${encodeURIComponent( // Construye un URI de datos codificado en URL con el SVG del logo de Google para usarlo en el componente Image en web
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' + // Apertura del SVG de Google con viewBox de 48x48 unidades
  '<path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>' + // Trazo amarillo del logo de Google (parte superior derecha)
  '<path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>' + // Trazo rojo del logo de Google (parte superior izquierda)
  '<path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>' + // Trazo verde del logo de Google (parte inferior)
  '<path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>' + // Trazo azul del logo de Google (parte derecha)
  '</svg>' // Cierre del elemento SVG
)}` ; // Cierre del template literal GOOGLE_LOGO_URI

export const LoginScreen: React.FC = () => { // Declara y exporta el componente funcional LoginScreen tipado como React.FC
  const navigation = useNavigation(); // Obtiene el objeto de navegación para navegar entre pantallas
  const { email, setEmail, password, setPassword, loading, errors, handleLogin } = useLoginForm(); // Desestructura del hook: campos email/password, sus setters, estado de carga, errores de validación y función de submit
  const { width } = useWindowDimensions(); // Obtiene el ancho actual de la ventana para determinar el layout
  const insets = useSafeAreaInsets(); // Obtiene los insets del área segura para posicionar el botón de volver correctamente
  const isWide = width >= 768; // Booleano: true si la pantalla tiene 768px o más (modo escritorio/tablet)
  const { t } = useTranslation();

  const BackButton = ( // Define el botón de volver como constante JSX reutilizable en ambos layouts
    <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>{/* Botón circular de volver posicionado sobre el inset del área segura; al presionar regresa a la pantalla anterior */}
      <Ionicons name="chevron-back" size={22} color={Colors.primary} />{/* Ícono de flecha hacia atrás en color morado primario */}
    </TouchableOpacity> // Cierre del TouchableOpacity del botón de volver
  ); // Cierre de la constante BackButton

  const FormPanel = ( // Define el panel del formulario como constante JSX reutilizable en ambos layouts
    <ScrollView // ScrollView para manejar el contenido cuando el teclado aparece en pantallas pequeñas
      contentContainerStyle={styles.formScroll} // Aplica padding y justifyContent center al área de contenido del scroll
      keyboardShouldPersistTaps="always" // Permite tocar elementos aunque el teclado esté abierto sin cerrarlo primero
      showsVerticalScrollIndicator={false} // Oculta la barra de scroll vertical
      overScrollMode="never" // Desactiva el efecto de rebote al llegar al final del scroll en Android
      bounces={false} // Desactiva el efecto de rebote al llegar al final del scroll en iOS
    >{/* Cierre de la apertura del ScrollView */}
      {/* Wrapper con justifyContent aquí para evitar el bug de Android
          donde justifyContent en contentContainerStyle desalinea los toques */}
      <View style={styles.formInner}>{/* Contenedor interno del formulario sin estilos propios (workaround para bug de Android) */}
        {/* Avatar */}
        <View style={styles.avatarCircle}>{/* Círculo morado claro que contiene el ícono de persona como avatar */}
          <Ionicons name="person" size={38} color={Colors.primary} />{/* Ícono de silueta de persona en morado primario, tamaño 38 */}
        </View>{/* Cierre del avatarCircle */}

        {/* Inputs */}
        <Input
          placeholder={t('emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon="mail-outline"
          error={errors.email}
          containerStyle={styles.inputSpacing}
        />

        <Input
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon="lock-closed-outline"
          error={errors.password}
          containerStyle={styles.inputSpacing}
        />

        {/* Olvidé contraseña */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword' as never)}
          style={styles.forgotRow}
        >
          <Text style={styles.forgotText}>{t('forgotPasswordLink')}</Text>
        </TouchableOpacity>

        {/* Registrarse / Ingresar */}
        <View style={styles.authRow}>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.registerBtnText}>{t('register')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? t('loginBtnLoading') : t('loginBtn')}</Text>
          </TouchableOpacity>
        </View>

        {/* Google */}
        <TouchableOpacity style={styles.googleBtn}>
          {Platform.OS === 'web'
            ? <Image source={{ uri: GOOGLE_LOGO_URI }} style={styles.googleLogoImg} />
            : <Ionicons name="logo-google" size={20} color="#4285F4" />}
          <Text style={styles.googleText}>{t('loginWithGoogle')}</Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity style={styles.facebookBtn}>
          <Ionicons name="logo-facebook" size={20} color="#fff" />
          <Text style={styles.facebookText}>{t('loginWithFacebook')}</Text>
        </TouchableOpacity>
      </View>{/* Cierre de formInner */}
    </ScrollView> // Cierre del ScrollView del FormPanel
  ); // Cierre de la constante FormPanel

  // ── Layout web: imagen izquierda + formulario derecha ──
  if (isWide) { // Si la pantalla es ancha (≥768px) renderiza el layout de dos columnas
    return ( // Inicio del retorno JSX del layout web
      <View style={styles.wideRoot}>{/* Contenedor raíz en fila horizontal para el layout de dos columnas */}
        {/* Panel imagen */}
        <View style={styles.imagePanel}>{/* Panel izquierdo que contiene la imagen de fondo con overlay */}
          <Image // Imagen de fondo del panel izquierdo
            source={require('../../../assets/images/login.png')} // Imagen local del slide 1 — ruta: app/assets/images/slide1.jpg
            style={styles.heroImage} // Posicionada absolutamente para cubrir todo el panel
            resizeMode="cover" // Escala la imagen para cubrir el contenedor sin deformarla
          />{/* Cierre de Image */}
          <View style={styles.imageOverlay} />{/* Overlay semitransparente morado sobre la imagen para mejorar legibilidad del texto */}
          <View style={styles.imageBadge}>{/* Contenedor del texto branding posicionado en la parte inferior del panel */}
            <Text style={styles.imageBadgeText}>👌 TraduceSeña</Text>{/* Nombre de la app con emoji en blanco y negrita */}
            <Text style={styles.imageTagline}>Comunícate sin barreras</Text>{/* Slogan de la app en blanco semiopaco */}
          </View>{/* Cierre de imageBadge */}
        </View>{/* Cierre de imagePanel */}

        {/* Panel formulario */}
        <View style={styles.formPanel}>{/* Panel derecho de 420px de ancho con fondo lavanda para el formulario */}
          {BackButton}{/* Botón de volver posicionado absolutamente en la esquina superior izquierda */}
          {FormPanel}{/* Formulario completo de login con scroll */}
        </View>{/* Cierre de formPanel */}
      </View> // Cierre de wideRoot
    ); // Cierre del return del layout web
  } // Cierre del bloque if (isWide)

  // ── Layout móvil: fondo lavanda full screen ──
  return ( // Retorno del layout móvil cuando la pantalla es menor a 768px
    <KeyboardAvoidingView // Contenedor que sube el contenido cuando aparece el teclado
      style={styles.mobileRoot} // Fondo lavanda que ocupa toda la pantalla
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // En iOS usa behavior 'padding', en Android no aplica ninguno
    >{/* Cierre de la apertura del KeyboardAvoidingView */}
      {BackButton}{/* Botón de volver posicionado absolutamente en la esquina superior izquierda */}
      {FormPanel}{/* Formulario completo de login con scroll */}
    </KeyboardAvoidingView> // Cierre del KeyboardAvoidingView del layout móvil
  ); // Cierre del return del layout móvil
}; // Cierre del componente LoginScreen

const styles = StyleSheet.create({ // Crea la hoja de estilos del componente con optimización nativa
  // ── Web ──
  wideRoot: { flex: 1, flexDirection: 'row' }, // Línea 177 — contenedor raíz del layout web: ocupa toda la pantalla en fila horizontal
  imagePanel: { flex: 1, overflow: 'hidden', position: 'relative' }, // Línea 178 — panel imagen ocupa el espacio restante, recorta contenido y es posicionado relativo
  heroImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }, // Línea 179 — imagen de fondo posicionada absolutamente cubriendo todo el panel
  imageOverlay: { // Línea 180 — overlay semitransparente sobre la imagen del panel izquierdo
    ...StyleSheet.absoluteFillObject, // Línea 181 — expande el overlay para cubrir absolutamente todo el contenedor padre
  }, // Cierre del estilo imageOverlay
  imageBadge: { // Línea 184 — contenedor del branding posicionado en la esquina inferior izquierda del panel
    position: 'absolute', // Línea 185 — posicionado absolutamente dentro del imagePanel
    bottom: 40, // Línea 186 — a 40px del borde inferior del panel
    left: 40, // Línea 187 — a 40px del borde izquierdo del panel
  }, // Cierre del estilo imageBadge
  imageBadgeText: { // Línea 189 — estilos del nombre de la app en el panel de imagen
    fontSize: 26, // Línea 190 — tamaño de fuente grande de 26px
    fontWeight: '900', // Línea 191 — peso de fuente máximo (extra bold)
    color: '#fff', // Línea 192 — color blanco para contrastar con la imagen
    letterSpacing: 0.3, // Línea 193 — espaciado entre letras de 0.3px
  }, // Cierre del estilo imageBadgeText
  imageTagline: { // Línea 195 — estilos del slogan debajo del nombre en el panel de imagen
    fontSize: 16, // Línea 196 — tamaño de fuente de 16px
    color: 'rgba(255, 255, 255, 0.85)', // Línea 197 — blanco al 85% de opacidad para efecto sutil
    marginTop: 6, // Línea 198 — margen superior de 6px respecto al nombre
    fontWeight: '500', // Línea 199 — peso de fuente medio
  }, // Cierre del estilo imageTagline
  formPanel: { // Línea 201 — estilos del panel derecho que contiene el formulario
    width: 420, // Línea 202 — ancho fijo de 420px para el panel del formulario en web
    backgroundColor: '#EDE9FE', // Línea 203 — fondo lavanda del panel de formulario
    justifyContent: 'center', // Línea 204 — centra verticalmente el formulario dentro del panel
  }, // Cierre del estilo formPanel

  // ── Móvil ──
  mobileRoot: { flex: 1, backgroundColor: '#EDE9FE' }, // Línea 208 — contenedor raíz del layout móvil: ocupa toda la pantalla con fondo lavanda

  // ── Formulario (compartido) ──
  formScroll: { // Línea 211 — estilos del área de contenido del ScrollView
    flexGrow: 1, // Línea 212 — permite que el contenido crezca para ocupar todo el espacio disponible
    paddingHorizontal: 32, // Línea 213 — padding horizontal de 32px en los laterales del formulario
    paddingVertical: 48, // Línea 214 — padding vertical de 48px arriba y abajo del formulario
    justifyContent: 'center', // Línea 215 — centra verticalmente el formulario cuando hay espacio suficiente
  }, // Cierre del estilo formScroll
  formInner: {}, // Línea 217 — contenedor interno vacío (workaround para bug de Android con justifyContent)

  // Avatar
  avatarCircle: { // Línea 220 — estilos del círculo de avatar
    width: 80, // Línea 221 — ancho del círculo de 80px
    height: 80, // Línea 222 — alto del círculo de 80px
    borderRadius: 40, // Línea 223 — radio de borde igual a la mitad del tamaño para hacerlo circular
    backgroundColor: '#DDD6FE', // Línea 224 — fondo lavanda medio para el círculo del avatar
    alignItems: 'center', // Línea 225 — centra horizontalmente el ícono dentro del círculo
    justifyContent: 'center', // Línea 226 — centra verticalmente el ícono dentro del círculo
    alignSelf: 'center', // Línea 227 — centra el círculo horizontalmente en el contenedor
    marginBottom: 32, // Línea 228 — margen inferior de 32px separando el avatar de los inputs
  }, // Cierre del estilo avatarCircle

  // Inputs
  inputSpacing: { width: '100%', marginBottom: 14 }, // Línea 232 — ancho completo y margen inferior de 14px entre campos de texto

  // Olvidé contraseña
  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 }, // Línea 235 — alinea el enlace a la derecha y agrega margen inferior de 24px
  forgotText: { // Línea 236 — estilos del texto del enlace de recuperación de contraseña
    fontSize: 12, // Línea 237 — tamaño de fuente pequeño de 12px
    color: Colors.primary, // Línea 238 — color morado primario para indicar que es un enlace
    fontWeight: '600', // Línea 239 — peso semibold para destacar el texto
  }, // Cierre del estilo forgotText

  // Botones auth
  authRow: { // Línea 243 — fila contenedora de los botones Registrarse e Ingresar
    flexDirection: 'row', // Línea 244 — botones en fila horizontal
    gap: 12, // Línea 245 — separación de 12px entre los botones
    marginBottom: 20, // Línea 246 — margen inferior de 20px bajo los botones
  }, // Cierre del estilo authRow
  registerBtn: { // Línea 248 — estilos del botón de registro
    flex: 1, // Línea 249 — ocupa el 50% del espacio disponible en la fila
    backgroundColor: '#C4B5FD', // Línea 250 — fondo lavanda medio para el botón de registro
    borderRadius: 12, // Línea 251 — bordes redondeados de 12px
    paddingVertical: 14, // Línea 252 — padding vertical de 14px para un botón de buen tamaño táctil
    alignItems: 'center', // Línea 253 — centra el texto horizontalmente
    justifyContent: 'center', // Línea 254 — centra el texto verticalmente
  }, // Cierre del estilo registerBtn
  registerBtnText: { // Línea 256 — estilos del texto del botón de registro
    color: '#5B21B6', // Línea 257 — color morado oscuro para el texto del botón de registro
    fontSize: 14, // Línea 258 — tamaño de fuente de 14px
    fontWeight: '700', // Línea 259 — peso bold para el texto del botón
  }, // Cierre del estilo registerBtnText
  loginBtn: { // Línea 261 — estilos del botón de login
    flex: 1, // Línea 262 — ocupa el 50% del espacio disponible en la fila
    backgroundColor: Colors.primary, // Línea 263 — fondo morado primario para el botón de login
    borderRadius: 12, // Línea 264 — bordes redondeados de 12px
    paddingVertical: 14, // Línea 265 — padding vertical de 14px para un botón de buen tamaño táctil
    alignItems: 'center', // Línea 266 — centra el texto horizontalmente
    justifyContent: 'center', // Línea 267 — centra el texto verticalmente
  }, // Cierre del estilo loginBtn
  loginBtnText: { // Línea 269 — estilos del texto del botón de login
    color: '#fff', // Línea 270 — color blanco para el texto del botón de login
    fontSize: 14, // Línea 271 — tamaño de fuente de 14px
    fontWeight: '700', // Línea 272 — peso bold para el texto del botón
  }, // Cierre del estilo loginBtnText
  btnDisabled: { opacity: 0.6 }, // Línea 274 — reduce la opacidad al 60% cuando el botón está desactivado (durante la carga)

  // Botón volver
  backBtn: { // Línea 277 — estilos del botón circular de volver
    position: 'absolute', // Línea 278 — posicionado absolutamente respecto al contenedor padre
    top: 20, // Línea 279 — a 20px del borde superior (sobreescrito dinámicamente con insets.top)
    left: 20, // Línea 280 — a 20px del borde izquierdo
    zIndex: 20, // Línea 281 — z-index alto para que aparezca encima de otros elementos
    width: 38, // Línea 282 — ancho del botón de 38px
    height: 38, // Línea 283 — alto del botón de 38px
    borderRadius: 19, // Línea 284 — radio de borde igual a la mitad para hacerlo circular
    backgroundColor: 'rgba(255,255,255,0.9)', // Línea 285 — fondo blanco al 90% de opacidad
    alignItems: 'center', // Línea 286 — centra el ícono horizontalmente
    justifyContent: 'center', // Línea 287 — centra el ícono verticalmente
    shadowColor: '#000', // Línea 288 — color de sombra en negro
    shadowOffset: { width: 0, height: 2 }, // Línea 289 — sombra desplazada 2px hacia abajo
    shadowOpacity: 0.08, // Línea 290 — sombra muy sutil al 8% de opacidad
    shadowRadius: 6, // Línea 291 — radio de difuminado de 6px
    elevation: 3, // Línea 292 — elevación en Android de 3 unidades
  }, // Cierre del estilo backBtn

  // Social
  googleBtn: { // Línea 296 — estilos del botón de autenticación con Google
    flexDirection: 'row', // Línea 297 — logo y texto en fila horizontal
    alignItems: 'center', // Línea 298 — alinea verticalmente logo y texto
    justifyContent: 'center', // Línea 299 — centra horizontalmente el contenido
    gap: 12, // Línea 300 — separación de 12px entre el logo y el texto
    backgroundColor: '#fff', // Línea 301 — fondo blanco para el botón de Google
    borderRadius: 12, // Línea 302 — bordes redondeados de 12px
    paddingVertical: 14, // Línea 303 — padding vertical de 14px
    marginBottom: 12, // Línea 304 — margen inferior de 12px entre el botón de Google y el de Facebook
    shadowColor: '#000', // Línea 305 — color de sombra en negro
    shadowOffset: { width: 0, height: 2 }, // Línea 306 — sombra desplazada 2px hacia abajo
    shadowOpacity: 0.08, // Línea 307 — sombra sutil al 8% de opacidad
    shadowRadius: 6, // Línea 308 — radio de difuminado de 6px
    elevation: 2, // Línea 309 — elevación en Android de 2 unidades
  }, // Cierre del estilo googleBtn
  googleLogoImg: { width: 20, height: 20 }, // Línea 311 — imagen del logo SVG de Google de 20x20px
  googleText: { // Línea 312 — estilos del texto del botón de Google
    fontSize: 16, // Línea 313 — tamaño de fuente de 16px
    fontWeight: '700', // Línea 314 — peso bold para el texto
    color: '#3C4043', // Línea 315 — color gris oscuro oficial de Google para el texto
  }, // Cierre del estilo googleText
  facebookBtn: { // Línea 317 — estilos del botón de autenticación con Facebook
    flexDirection: 'row', // Línea 318 — logo y texto en fila horizontal
    alignItems: 'center', // Línea 319 — alinea verticalmente logo y texto
    justifyContent: 'center', // Línea 320 — centra horizontalmente el contenido
    gap: 12, // Línea 321 — separación de 12px entre el logo y el texto
    backgroundColor: '#1877F2', // Línea 322 — fondo azul oficial de Facebook
    borderRadius: 12, // Línea 323 — bordes redondeados de 12px
    paddingVertical: 14, // Línea 324 — padding vertical de 14px
  }, // Cierre del estilo facebookBtn
  facebookText: { // Línea 326 — estilos del texto del botón de Facebook
    fontSize: 16, // Línea 327 — tamaño de fuente de 16px
    fontWeight: '700', // Línea 328 — peso bold para el texto
    color: '#fff', // Línea 329 — color blanco para contrastar con el fondo azul de Facebook
  }, // Cierre del estilo facebookText
}); // Cierre del StyleSheet.create
