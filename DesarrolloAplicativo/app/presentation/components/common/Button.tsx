/**
 * @file Button.tsx
 * @description Componente de botón reutilizable con soporte para múltiples variantes,
 * tamaños, estado de carga y deshabilitado.
 *
 * @prop title - Texto del botón.
 * @prop onPress - Función a ejecutar al presionar.
 * @prop variant - Estilo visual: 'primary' (gradiente) | 'secondary' | 'danger' | 'outline' | 'ghost'. Default: 'primary'.
 * @prop size - Tamaño: 'sm' | 'md' | 'lg'. Default: 'md'.
 * @prop loading - Muestra un spinner y deshabilita el botón. Default: false.
 * @prop disabled - Deshabilita el botón. Default: false.
 * @prop fullWidth - Si true, el botón ocupa el 100% del ancho. Default: false.
 * @prop style - Estilos adicionales para el contenedor.
 * @prop textStyle - Estilos adicionales para el texto.
 *
 * Se exporta como `React.memo` para evitar renders innecesarios.
 */
import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { BorderRadius, ComponentSizes, FontWeight, Shadows } from '../../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

function ButtonBase({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizeTokens = ComponentSizes.button[size];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  if (variant === 'primary') {
    return (
      <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
          style={[isDisabled && styles.disabled, style]}
        >
          <LinearGradient
            colors={Colors.gradientPrimaryDeep}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientBase,
              { height: sizeTokens.height, paddingHorizontal: sizeTokens.paddingHorizontal },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.text, styles.primaryText, textStyle]}>{title}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.base,
          styles[variant],
          { height: sizeTokens.height, paddingHorizontal: sizeTokens.paddingHorizontal },
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles], textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export const Button = React.memo(ButtonBase);

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBase: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 1.5,
    borderColor: Colors.primaryLighter,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  primaryText:   { color: '#fff' },
  secondaryText: { color: Colors.primary },
  dangerText:    { color: '#fff' },
  outlineText:   { color: Colors.primary },
  ghostText:     { color: Colors.primary },
});
