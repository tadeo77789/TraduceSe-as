/**
 * @file MainTabNavigator.tsx
 * @description Navegador de pestañas principal (pantallas autenticadas).
 *
 * En **móvil**: muestra una barra de tabs inferior con íconos Ionicons.
 * En **web**: oculta la barra inferior y usa `WebTopBar` como header superior.
 *
 * Tabs disponibles: Translation, Alarms, Alphabet, Stats, History, Profile.
 * El tipo `MainTabParams` define los nombres de ruta para tipado estricto.
 */
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TranslationScreen } from '../screens/Translation/TranslationScreen';
import { AlarmsScreen } from '../screens/Alarms/AlarmsScreen';
import { AlphabetScreen } from '../screens/Alphabet/AlphabetScreen';
import { StatsScreen } from '../screens/Stats/StatsScreen';
import { HistoryScreen } from '../screens/History/HistoryScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { WebTopBar } from '../components/common/WebTopBar';
import { Colors } from '../../constants/colors';

export type MainTabParams = {
  Translation: undefined;
  Alarms: undefined;
  Alphabet: undefined;
  Stats: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParams>();

const isWeb = Platform.OS === 'web';

export const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      // En web: header arriba (WebTopBar), sin barra inferior
      // En móvil: sin header, barra de tabs abajo
      headerShown: isWeb,
      header: isWeb ? (props) => <WebTopBar {...props} /> : undefined,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: isWeb ? styles.hidden : styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, [string, string]> = {
          Translation: ['language-outline', 'language'],
          Alarms:      ['alarm-outline',    'alarm'],
          Alphabet:    ['hand-left-outline','hand-left'],
          Stats:       ['bar-chart-outline','bar-chart'],
          History:     ['time-outline',     'time'],
          Profile:     ['person-outline',   'person'],
        };
        const [inactive, active] = icons[route.name] || ['ellipse-outline', 'ellipse'];
        return <Ionicons name={(focused ? active : inactive) as any} size={22} color={color} />;
      },
      tabBarLabel: ({
        Translation: 'Traducción',
        Alarms:      'Alarmas',
        Alphabet:    'Alfabeto',
        Stats:       'Estadística',
        History:     'Historial',
        Profile:     'Perfil',
      } as Record<string, string>)[route.name] || route.name,
    })}
  >
    <Tab.Screen name="Translation" component={TranslationScreen} />
    <Tab.Screen name="Alarms"      component={AlarmsScreen}      />
    <Tab.Screen name="Alphabet"    component={AlphabetScreen}    />
    <Tab.Screen name="Stats"       component={StatsScreen}       />
    <Tab.Screen name="History"     component={HistoryScreen}     />
    <Tab.Screen name="Profile"     component={ProfileScreen}     />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 74,
    paddingBottom: 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 16,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  hidden: { display: 'none' },
});
