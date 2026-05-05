/**
 * @file Badge.tsx
 * @description Insignia compacta para conteos o etiquetas (ej. "26 letras", "3 registros").
 * Hereda el color del tema activo si no se pasa `color`.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../../../state/ThemeContext';

interface BadgeProps {
  label: string;
  color?: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ label, color, background, style }) => {
  const C = useColors();
  const fg = color ?? C.primary;
  const bg = background ?? C.primaryBg;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
