// Ubicación: app/presentation/navigation/MainTabNavigator.tsx
/**
 * @file MainTabNavigator.tsx
 * @description Navegador de pestañas principal (pantallas autenticadas).
 *
 * En **móvil**: muestra una barra de tabs inferior con íconos Ionicons.
 * En **web**: oculta la barra inferior y usa `WebTopBar` como header superior.
 *
 * Tabs disponibles: Translation, Alphabet, Stats, History, Profile.
 * El tipo `MainTabParams` define los nombres de ruta para tipado estricto.
 */
import React from 'react'; // Importa React; necesario para usar JSX — fuente: node_modules/react
import { Platform, StyleSheet, useWindowDimensions } from 'react-native'; // Importa Platform (detección de SO), StyleSheet (estilos) y useWindowDimensions (dimensiones del viewport) — fuente: node_modules/react-native
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Importa la función que crea un navegador de pestañas en la parte inferior de la pantalla — fuente: node_modules/@react-navigation/bottom-tabs
import { Ionicons } from '@expo/vector-icons'; // Importa la librería de íconos vectoriales Ionicons usada en la barra de tabs — fuente: node_modules/@expo/vector-icons
import { TranslationScreen } from '../screens/Translation/TranslationScreen'; // Importa la pantalla principal de traducción de señas — fuente: app/presentation/screens/Translation/TranslationScreen.tsx
import { AlphabetScreen } from '../screens/Alphabet/AlphabetScreen'; // Importa la pantalla del alfabeto de señas — fuente: app/presentation/screens/Alphabet/AlphabetScreen.tsx
import { StatsScreen } from '../screens/Stats/StatsScreen'; // Importa la pantalla de estadísticas de uso — fuente: app/presentation/screens/Stats/StatsScreen.tsx
import { HistoryScreen } from '../screens/History/HistoryScreen'; // Importa la pantalla del historial de traducciones — fuente: app/presentation/screens/History/HistoryScreen.tsx
import { ProfileStackNavigator } from './ProfileStackNavigator'; // Importa el stack anidado del tab de perfil (contiene ProfileScreen) — fuente: app/presentation/navigation/ProfileStackNavigator.tsx
import { WebTopBar } from '../components/common/WebTopBar'; // Importa la barra de navegación superior usada en web en lugar de la barra de tabs inferior — fuente: app/presentation/components/common/WebTopBar.tsx
import { Colors } from '../../constants/colors'; // Importa la paleta de colores estáticos de la app — fuente: app/constants/colors.ts
import { useColors } from '../../state/ThemeContext'; // Importa el hook que provee los colores reactivos según el tema (claro/oscuro) activo — fuente: app/state/ThemeContext.tsx
import { useTranslation } from '../../i18n';

export type MainTabParams = { // Define y exporta el tipo TypeScript que mapea cada tab con sus parámetros esperados
  Translation: undefined; // Ruta 'Translation' no recibe parámetros de navegación
  Alphabet: undefined; // Ruta 'Alphabet' no recibe parámetros de navegación
  Stats: undefined; // Ruta 'Stats' no recibe parámetros de navegación
  History: undefined; // Ruta 'History' no recibe parámetros de navegación
  Profile: undefined; // Ruta 'Profile' no recibe parámetros de navegación
}; // Cierra la definición del tipo MainTabParams

const Tab = createBottomTabNavigator<MainTabParams>(); // Crea la instancia del navegador de tabs inferior tipada con MainTabParams; expone Tab.Navigator y Tab.Screen

export const MainTabNavigator: React.FC = () => { // Define y exporta el componente funcional MainTabNavigator; gestiona todas las pestañas de la app autenticada
  const { width } = useWindowDimensions(); // Obtiene el ancho actual del viewport; se actualiza automáticamente si el usuario rota el dispositivo o redimensiona la ventana
  const C = useColors(); // Obtiene los tokens de color reactivos del tema activo (claro u oscuro)
  const { t } = useTranslation();
  // Muestra la barra superior solo en web con viewport ancho (≥ 1024 px)
  // En móvil real y en web con viewport estrecho usa la barra de tabs inferior
  const isWide = Platform.OS === 'web' && width >= 1024; // Calcula si la pantalla es web de escritorio (≥1024px); true activa la barra superior WebTopBar y oculta la barra inferior
  // En pantallas muy estrechas (< 480 px) oculta las etiquetas de los tabs
  const hideLabels = width < 480; // Calcula si el viewport es muy estrecho; true oculta los textos de las pestañas para ganar espacio vertical

  const tabBarTheme = { // Define un objeto con los colores dinámicos de la barra de tabs según el tema activo
    backgroundColor: C.surface, // Color de fondo de la barra de tabs según el tema (claro/oscuro)
    borderTopColor: C.border, // Color del borde superior de la barra de tabs según el tema (claro/oscuro)
  }; // Cierra el objeto tabBarTheme

  return ( // Retorna el árbol JSX del navegador de pestañas
  <Tab.Navigator // Inicia el navegador de pestañas con su configuración global
    screenOptions={({ route }) => ({ // Función que recibe la ruta activa y retorna las opciones de pantalla; se evalúa para cada tab
      headerShown: isWide, // Muestra el header solo en modo web de escritorio (isWide=true); en móvil se oculta
      header: isWide ? (props) => <WebTopBar {...props} /> : undefined, // Si es web de escritorio usa WebTopBar como header personalizado; si no, no hay header
      tabBarActiveTintColor: Colors.primary, // Color del ícono y texto del tab activo; usa el color primario (#7C3AED) de la paleta estática
      tabBarInactiveTintColor: C.textSecondary, // Color del ícono y texto de los tabs inactivos; usa el token de texto secundario del tema activo
      tabBarStyle: isWide ? styles.hidden : (hideLabels // Controla el estilo de la barra de tabs: oculta en web de escritorio, compacta en viewports estrechos, normal en los demás
        ? { ...styles.tabBarCompact, ...tabBarTheme } // Si es viewport estrecho aplica el estilo compacto (altura 56px) mezclado con los colores del tema
        : { ...styles.tabBar, ...tabBarTheme }), // Si es viewport normal aplica el estilo estándar (altura 74px) mezclado con los colores del tema
      tabBarShowLabel: !hideLabels, // Muestra las etiquetas de texto solo cuando el viewport es suficientemente ancho (≥480px)
      tabBarLabelStyle: styles.tabLabel, // Aplica el estilo tipográfico (tamaño y peso) a las etiquetas de todos los tabs
      tabBarIcon: ({ focused, color }) => { // Función que renderiza el ícono de cada tab; recibe si está enfocado y el color correspondiente
        const icons: Record<string, [string, string]> = { // Mapa que asocia cada nombre de ruta con su par de íconos [inactivo, activo] de Ionicons
          Translation: ['language-outline', 'language'], // Íconos para el tab de traducción: outline (inactivo) y sólido (activo)
          Alphabet:    ['hand-left-outline','hand-left'], // Íconos para el tab de alfabeto: outline (inactivo) y sólido (activo)
          Stats:       ['bar-chart-outline','bar-chart'], // Íconos para el tab de estadísticas: outline (inactivo) y sólido (activo)
          History:     ['time-outline',     'time'], // Íconos para el tab de historial: outline (inactivo) y sólido (activo)
          Profile:     ['person-outline',   'person'], // Íconos para el tab de perfil: outline (inactivo) y sólido (activo)
        }; // Cierra el objeto de mapeo de íconos
        const [inactive, active] = icons[route.name] || ['ellipse-outline', 'ellipse']; // Extrae el par de íconos para la ruta actual; usa íconos genéricos si la ruta no está en el mapa
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />; // Renderiza el ícono Ionicons: usa el ícono activo si el tab está seleccionado, inactivo si no; tamaño 22px con el color provisto por el navigator
      }, // Cierra la función tabBarIcon
      tabBarLabel: ({
        Translation: t('tabTranslation'),
        Alphabet:    t('tabAlphabet'),
        Stats:       t('tabStats'),
        History:     t('tabHistory'),
        Profile:     t('tabProfile'),
      } as Record<string, string>)[route.name] || route.name,
    })} // Cierra el objeto retornado por screenOptions y la prop screenOptions
  >
    <Tab.Screen name="Translation" component={TranslationScreen} />
    <Tab.Screen name="Alphabet"    component={AlphabetScreen}    />
    <Tab.Screen name="Stats"       component={StatsScreen}       />
    <Tab.Screen name="History"     component={HistoryScreen}     />
    <Tab.Screen name="Profile"     component={ProfileStackNavigator} />
  </Tab.Navigator>
  ); // Cierra el return del componente MainTabNavigator
}; // Cierra la definición del componente MainTabNavigator

const styles = StyleSheet.create({ // Crea el objeto de estilos estático para la barra de tabs; StyleSheet.create optimiza el rendimiento
  tabBar: { // Estilo de la barra de tabs en modo normal (viewport ≥ 480px en móvil)
    backgroundColor: Colors.surface, // Color de fondo de la barra usando el token de superficie de la paleta estática
    borderTopColor: Colors.border, // Color del borde superior de la barra usando el token de borde de la paleta estática
    borderTopWidth: 1, // Grosor del borde superior separador de la barra de tabs en 1 píxel
    height: 74, // Altura total de la barra de tabs en modo normal (incluye íconos, etiquetas y padding)
    paddingBottom: 12, // Espacio inferior dentro de la barra; separa el contenido del borde inferior del dispositivo
    paddingTop: 8, // Espacio superior dentro de la barra; separa el contenido del borde superior de la barra
    shadowColor: '#000', // Color de la sombra proyectada sobre el contenido (negro puro)
    shadowOffset: { width: 0, height: -4 }, // Dirección de la sombra: hacia arriba (height negativo) y sin desplazamiento horizontal
    shadowOpacity: 0.07, // Opacidad de la sombra; valor bajo (7%) para una sombra sutil
    shadowRadius: 16, // Radio de difuminado de la sombra para un efecto suave
    elevation: 16, // Nivel de elevación en Android que controla la sombra en ese sistema operativo
  }, // Cierra el estilo tabBar
  tabBarCompact: { // Estilo de la barra de tabs en modo compacto (viewport < 480px, sin etiquetas)
    backgroundColor: Colors.surface, // Color de fondo de la barra compacta usando el token de superficie de la paleta estática
    borderTopColor: Colors.border, // Color del borde superior de la barra compacta usando el token de borde de la paleta estática
    borderTopWidth: 1, // Grosor del borde superior separador en 1 píxel
    height: 56, // Altura reducida a 56px para la barra compacta sin etiquetas de texto
    paddingBottom: 6, // Espacio inferior reducido dentro de la barra compacta
    paddingTop: 6, // Espacio superior reducido dentro de la barra compacta
    shadowColor: '#000', // Color de la sombra proyectada (negro puro)
    shadowOffset: { width: 0, height: -4 }, // Dirección de la sombra: hacia arriba sin desplazamiento horizontal
    shadowOpacity: 0.07, // Opacidad de la sombra; valor bajo (7%) para efecto sutil
    shadowRadius: 16, // Radio de difuminado de la sombra para un efecto suave
    elevation: 16, // Nivel de elevación en Android para la sombra
  }, // Cierra el estilo tabBarCompact
  tabLabel: { fontSize: 11, fontWeight: '600' }, // Estilo tipográfico de las etiquetas: tamaño 11px y peso semibold (600) para legibilidad compacta
  hidden: { display: 'none' }, // Oculta completamente la barra de tabs; se aplica en web de escritorio donde se usa WebTopBar en su lugar
}); // Cierra StyleSheet.create
