import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { BorderRadius, BorderWidth, ComponentSizes, FontWeight, TextStyles } from '../../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

function InputBase({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  containerStyle,
  size = 'md',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const sizeTokens = ComponentSizes.input[size];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { height: sizeTokens.height },
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={focused ? Colors.primary : Colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            { paddingHorizontal: sizeTokens.paddingHorizontal },
            leftIcon ? styles.inputWithLeft : null,
          ]}
          placeholderTextColor={Colors.textHint}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.rightIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={focused ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export const Input = React.memo(InputBase);

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    ...TextStyles.label,
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.medium,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#fff',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputWithLeft: {
    paddingLeft: 6,
  },
  leftIcon: {
    marginLeft: 14,
  },
  rightIcon: {
    padding: 12,
  },
  hint: {
    ...TextStyles.caption,
    color: Colors.textHint,
    marginTop: 4,
  },
  errorText: {
    ...TextStyles.caption,
    color: Colors.error,
    marginTop: 4,
    fontWeight: FontWeight.medium,
  },
});
