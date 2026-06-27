

import React from 'react';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TranslationScreen } from '../screens/Translation/TranslationScreen';
import { AlphabetScreen } from '../screens/Alphabet/AlphabetScreen';
import { StatsScreen } from '../screens/Stats/StatsScreen';
import { HistoryScreen } from '../screens/History/HistoryScreen';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { AdminStackNavigator } from './AdminStackNavigator';
import { WebTopBar } from '../components/common/WebTopBar';
import { Colors } from '../../shared/constants/colors';
import { useColors } from '../../shared/state/ThemeContext';
import { useTranslation } from '../../shared/i18n';
import { useAuth } from '../../shared/state/AuthContext';
import { isAdmin } from '../../shared/utils/adminAccess';

export type MainTabParams = {
  Translation: undefined;
  Alphabet: undefined;
  Stats: undefined;
  History: undefined;
  Admin: undefined;
  Profile: undefined;
};

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
  tabBarCompact: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 56,
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 16,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  hidden: { display: 'none' },
});
