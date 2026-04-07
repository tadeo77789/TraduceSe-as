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

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [selectedIdioma, setSelectedIdioma] = useState('Español');

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
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => Alert.alert('Cuenta eliminada'),
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.avatarCircle}
          >
            <Ionicons name="person" size={44} color="#fff" />
          </LinearGradient>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'luduarte@gmail.com'}</Text>
        </View>

        {/* Sección de cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.sectionCard}>
            <Input
              label="Tu correo"
              value={user?.email || 'luduarte@gmail.com'}
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

        {/* Sección de preferencias */}
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

            {/* Divider */}
            <View style={styles.divider} />

            {/* Idioma */}
            <Text style={styles.idiomaLabel}>Idioma</Text>
            <View style={styles.idiomaRow}>
              {IDIOMAS.map(lang => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setSelectedIdioma(lang)}
                  style={[styles.idiomaChip, selectedIdioma === lang && styles.idiomaChipActive]}
                >
                  <Text
                    style={[
                      styles.idiomaText,
                      selectedIdioma === lang && styles.idiomaTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <Button
            title="Cerrar sesión"
            onPress={handleLogout}
            fullWidth
          />

          <Button
            title="Eliminar cuenta"
            onPress={handleDeleteAccount}
            variant="danger"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.backgroundGray },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  inputStyle: { marginBottom: 12 },
  forgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  forgotLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  idiomaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  idiomaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  idiomaChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  idiomaChipActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  idiomaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  idiomaTextActive: { color: Colors.primary, fontWeight: '700' },
  actionsSection: { gap: 12 },
});
