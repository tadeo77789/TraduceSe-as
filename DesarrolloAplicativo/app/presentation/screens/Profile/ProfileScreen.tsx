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
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={44} color={Colors.textSecondary} />
          </View>
        </View>

        {/* Correo */}
        <View style={styles.fieldGroup}>
          <Input
            label="tu correo"
            value={user?.email || 'luduarte.@gamil.com'}
            editable={false}
            rightIcon="lock-closed-outline"
            containerStyle={styles.inputStyle}
          />
        </View>

        {/* Contraseña */}
        <View style={styles.fieldGroup}>
          <Input
            label="tu contraseña"
            value="••••••••"
            isPassword
            editable={false}
            containerStyle={styles.inputStyle}
          />
          <TouchableOpacity>
            <Text style={styles.forgotLink}>has olvidado tu contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Tema */}
        <View style={styles.themeRow}>
          <Text style={styles.themeLabel}>Tema(Claro/Oscuro)</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: Colors.toggleOff, true: Colors.toggleOn }}
            thumbColor="#fff"
          />
        </View>

        {/* Idioma */}
        <View style={styles.idiomaRow}>
          {IDIOMAS.map(lang => (
            <TouchableOpacity
              key={lang}
              onPress={() => setSelectedIdioma(lang)}
              style={styles.idiomaBtn}
            >
              <Text
                style={[
                  styles.idiomaText,
                  selectedIdioma === lang && styles.idiomaTextActive,
                ]}
              >
                {lang}
              </Text>
              {selectedIdioma === lang && <View style={styles.idiomaUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <Button
            title="cerrar session"
            onPress={handleLogout}
            fullWidth
            style={styles.logoutBtn}
          />

          <Button
            title="eliminar cuenta"
            onPress={handleDeleteAccount}
            variant="danger"
            fullWidth
            style={styles.deleteBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  fieldGroup: { marginBottom: 12 },
  inputStyle: { marginBottom: 4 },
  forgotLink: {
    fontSize: 13,
    color: Colors.primary,
    textDecorationLine: 'underline',
    marginLeft: 2,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 8,
  },
  themeLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  idiomaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  idiomaBtn: { alignItems: 'center', paddingBottom: 6 },
  idiomaText: { fontSize: 14, color: Colors.textSecondary },
  idiomaTextActive: { color: Colors.textPrimary, fontWeight: '700' },
  idiomaUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.textPrimary,
  },
  actionsSection: { gap: 12 },
  logoutBtn: { backgroundColor: Colors.primary },
  deleteBtn: {},
});
