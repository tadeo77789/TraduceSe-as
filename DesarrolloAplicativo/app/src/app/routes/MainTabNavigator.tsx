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
import { TranslationScreen } from '../../feature/Translation/pages/TranslationScreen'; // Importa la pantalla principal de traducción de señas — fuente: app/presentation/screens/Translation/TranslationScreen.tsx
import { AlphabetScreen } from '../../feature/Alphabet/pages/AlphabetScreen'; // Importa la pantalla del alfabeto de señas — fuente: app/presentation/screens/Alphabet/AlphabetScreen.tsx
import { StatsScreen } from '../../feature/Stats/pages/StatsScreen'; // Importa la pantalla de estadísticas de uso — fuente: app/presentation/screens/Stats/StatsScreen.tsx
import { HistoryScreen } from '../../feature/History/pages/HistoryScreen'; // Importa la pantalla del historial de traducciones — fuente: app/presentation/screens/History/HistoryScreen.tsx
import { ProfileStackNavigator } from './ProfileStackNavigator'; // Importa el stack anidado del tab de perfil (contiene ProfileScreen) — fuente: app/presentation/navigation/ProfileStackNavigator.tsx
import { AdminStackNavigator } from './AdminStackNavigator';
import { WebTopBar } from '../../shared/components/common/WebTopBar'; // Importa la barra de navegación superior usada en web en lugar de la barra de tabs inferior — fuente: app/presentation/components/common/WebTopBar.tsx
import { Colors } from '../../shared/constants/colors'; // Importa la paleta de colores estáticos de la app — fuente: app/constants/colors.ts
import { useColors } from '../providers/ThemeContext'; // Importa el hook que provee los colores reactivos según el tema (claro/oscuro) activo — fuente: app/state/ThemeContext.tsx
import { useTranslation } from '../config/i18n';
import { useAuth } from '../providers/AuthContext';
import { isAdmin } from '../../shared/utils/adminAccess';

export type MainTabParams = { // Define y exporta el tipo TypeScript que mapea cada tab con sus parámetros esperados
  Translation: undefined; // Ruta 'Translation' no recibe parámetros de navegación
  Alphabet: undefined; // Ruta 'Alphabet' no recibe parámetros de navegación
  Stats: undefined; // Ruta 'Stats' no recibe parámetros de navegación
  History: undefined; // Ruta 'History' no recibe parámetros de navegación
  Admin: undefined; // Ruta 'Admin' (solo visible para admins) — abre AdminStackNavigator
  Profile: undefined; // Ruta 'Profile' no recibe parámetros de navegación
}; // Cierra la definición del tipo MainTabParams

const Tab = createBottomTabNavigator<MainTabParams>(); 
export const MainTabNavigator: React.FC = () => { 
  const { width } = useWindowDimensions(); 
  const C = useColors(); 
  const { t } = useTranslation();
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user);
  
  const isWide = Platform.OS === 'web' && width >= 1024; 
  const hideLabels = width < 480; 
  const tabBarTheme = { 
    backgroundColor: C.surface, 
    borderTopColor: C.border, 
  }; 

  return ( 
  <Tab.Navigator 
    screenOptions={({ route }) => ({ 
      headerShown: isWide, 
      header: isWide ? (props) => <WebTopBar {...props} /> : undefined, 
      tabBarActiveTintColor: C.primary, 
      tabBarInactiveTintColor: C.textSecondary, 
      tabBarStyle: isWide ? styles.hidden : (hideLabels
        ? { ...styles.tabBarCompact, ...tabBarTheme } 
        : { ...styles.tabBar, ...tabBarTheme }),
      tabBarShowLabel: !hideLabels,
      tabBarLabelStyle: styles.tabLabel, 
      tabBarIcon: ({ focused, color }) => { 
        const icons: Record<string, [string, string]> = { 
          Translation: ['language-outline', 'language'], 
          Alphabet:    ['hand-left-outline','hand-left'], 
          Stats:       ['bar-chart-outline','bar-chart'], 
          History:     ['time-outline',     'time'], 
          Admin:       ['shield-outline',   'shield'], 
          Profile:     ['person-outline',   'person'], 
        }; 
        const [inactive, active] = icons[route.name] || ['ellipse-outline', 'ellipse']; 
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />; 
      }, 
      tabBarLabel: ({
        Translation: t('tabTranslation'),
        Alphabet:    t('tabAlphabet'),
        Stats:       t('tabStats'),
        History:     t('tabHistory'),
        Admin:       t('tabAdmin'),
        Profile:     t('tabProfile'),
      } as Record<string, string>)[route.name] || route.name,
    })} 
  >
    <Tab.Screen name="Translation" component={TranslationScreen} />
    <Tab.Screen name="Alphabet"    component={AlphabetScreen}    />
    <Tab.Screen name="Stats"       component={StatsScreen}       />
    <Tab.Screen name="History"     component={HistoryScreen}     />
    {userIsAdmin && (
      <Tab.Screen name="Admin"     component={AdminStackNavigator} />
    )}
    <Tab.Screen name="Profile"     component={ProfileStackNavigator} />
  </Tab.Navigator>
  ); 
}; 

const styles = StyleSheet.create({ 
  tabBar: {
    backgroundColor: Colors.surface, 
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
