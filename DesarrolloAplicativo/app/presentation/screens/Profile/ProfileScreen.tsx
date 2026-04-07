import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/common/AppHeader';
import { Colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../../state/AuthContext';
import { useTheme } from '../../../state/ThemeContext';

const IDIOMAS = ['Español', 'Inglés', 'Francés', 'Português'];

const USER_STATS = [
  { label: 'Traducciones', value: '1,248', icon: 'swap-horizontal-outline' as const, color: Colors.primary },
  { label: 'Señas aprendidas', value: '84', icon: 'hand-left-outline' as const, color: '#D97706' },
  { label: 'Alarmas', value: '3', icon: 'alarm-outline' as const, color: '#059669' },
];

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [selectedIdioma, setSelectedIdioma] = useState('Español');

  const displayName = user?.email?.split('@')[0] ?? 'Usuario';
  const displayEmail = user?.email ?? 'usuario@traducsenas.com';

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => Alert.alert('Cuenta eliminada') },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar + nombre */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#9333EA', '#7C3AED']} style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color="#fff" />
          </LinearGradient>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>

          {/* Badge de nivel */}
          <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.levelBadge}>
            <Ionicons name="ribbon-outline" size={13} color="#D97706" />
            <Text style={styles.levelText}>Nivel Intermedio</Text>
          </LinearGradient>
        </View>

        {/* Estadísticas del usuario */}
        <View style={styles.statsRow}>
          {USER_STATS.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Sección de cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.sectionCard}>
            <Input
              label="Correo electrónico"
              value={displayEmail}
              editable={false}
              rightIcon="lock-closed-outline"
              containerStyle={styles.inputStyle}
            />
            <Input
              label="Contraseña"
              value="••••••••"
              isPassword
              editable={false}
              containerStyle={styles.inputStyle}
            />
            <TouchableOpacity style={styles.forgotRow}>
              <Ionicons name="key-outline" size={14} color={Colors.primary} />
              <Text style={styles.forgotLink}>Cambiar contraseña</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.sectionCard}>
            {/* Tema */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <View style={[styles.prefIcon, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={Colors.primary} />
                </View>
                <Text style={styles.themeLabel}>Tema {isDark ? 'Oscuro' : 'Claro'}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: Colors.toggleOff, true: Colors.toggleOn }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.divider} />

            {/* Notificaciones */}
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <View style={[styles.prefIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="notifications-outline" size={18} color="#059669" />
                </View>
                <Text style={styles.themeLabel}>Notificaciones</Text>
              </View>
              <Switch
                value={true}
                trackColor={{ false: Colors.toggleOff, true: '#059669' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.divider} />

            {/* Idioma */}
            <Text style={styles.idiomaLabel}>Idioma de la app</Text>
            <View style={styles.idiomaRow}>
              {IDIOMAS.map(lang => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setSelectedIdioma(lang)}
                  style={[styles.idiomaChip, selectedIdioma === lang && styles.idiomaChipActive]}
                >
                  <Text style={[styles.idiomaText, selectedIdioma === lang && styles.idiomaTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Información de la app */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.sectionCard}>
            {[
              { icon: 'information-circle-outline', label: 'Versión de la app', value: '1.0.0' },
              { icon: 'document-text-outline', label: 'Términos y condiciones', value: '' },
              { icon: 'shield-checkmark-outline', label: 'Política de privacidad', value: '' },
            ].map((item, i) => (
              <View key={i}>
                {i > 0 && <View style={styles.divider} />}
                <TouchableOpacity style={styles.infoRow}>
                  <Ionicons name={item.icon as any} size={18} color={Colors.textSecondary} />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                  {!item.value && <Ionicons name="chevron-forward" size={16} color={Colors.textHint} />}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <Button title="Cerrar sesión" onPress={handleLogout} fullWidth />
          <Button title="Eliminar cuenta" onPress={handleDeleteAccount} variant="danger" fullWidth />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 20, paddingTop: 8 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  userName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, textTransform: 'capitalize' },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginBottom: 10 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  levelText: { fontSize: 12, fontWeight: '700', color: '#D97706' },

  // Stats del usuario
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 10, marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  inputStyle: { marginBottom: 12 },
  forgotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2 },
  forgotLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  prefRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 4,
  },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  themeLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  idiomaLabel: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  idiomaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  idiomaChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  idiomaChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  idiomaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  idiomaTextActive: { color: Colors.primary, fontWeight: '700' },

  // Acerca de
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  infoLabel: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  infoValue: { fontSize: 13, color: Colors.textSecondary },

  actionsSection: { gap: 12 },
});
