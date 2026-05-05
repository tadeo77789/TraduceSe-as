// Archivo: app/presentation/components/common/Input.tsx — Componente de campo de texto reutilizable con etiqueta, íconos, error, hint y toggle de contraseña
/**
 * @file Input.tsx
 * @description Componente de campo de texto reutilizable con soporte para
 * etiqueta, icono izquierdo/derecho, estado de error, hint y visibilidad de contraseña.
 *
 * Extiende `TextInputProps` de React Native.
 *
 * @prop label - Etiqueta visible encima del campo.
 * @prop error - Mensaje de error (resalta el borde en rojo y muestra el texto).
 * @prop hint - Texto de ayuda (solo visible si no hay error).
 * @prop leftIcon - Nombre de ícono Ionicons a mostrar a la izquierda.
 * @prop rightIcon - Nombre de ícono Ionicons a mostrar a la derecha.
 * @prop onRightIconPress - Acción al presionar el ícono derecho.
 * @prop isPassword - Si true, muestra toggle de visibilidad de contraseña. Default: false.
 * @prop size - Tamaño del campo: 'sm' | 'md' | 'lg'. Default: 'md'.
 * @prop containerStyle - Estilos adicionales para el contenedor externo.
 *
 * Se exporta como `React.memo` para evitar renders innecesarios.
 */
import React, { useState } from 'react'; // Importa React y el hook useState (maneja estado local del componente) — de 'react'
import {
  View, // Importa View: contenedor rectangular básico para layouts — de 'react-native'
  TextInput, // Importa TextInput: campo de entrada de texto nativo — de 'react-native'
  Text, // Importa Text: componente para mostrar texto plano — de 'react-native'
  StyleSheet, // Importa StyleSheet: utilidad para crear hojas de estilos optimizadas — de 'react-native'
  TouchableOpacity, // Importa TouchableOpacity: área táctil con efecto de opacidad para los íconos — de 'react-native'
  TextInputProps, // Importa TextInputProps: tipo TypeScript con todas las props nativas de TextInput — de 'react-native'
  ViewStyle, // Importa ViewStyle: tipo TypeScript para estilos de contenedores View — de 'react-native'
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importa Ionicons: librería de íconos vectoriales (eye, person, etc.) — de '@expo/vector-icons'
import { Colors } from '../../../constants/colors'; // Importa Colors: paleta de colores centralizada del design system — de app/constants/colors.ts
import { useColors } from '../../../state/ThemeContext'; // Importa useColors: hook que retorna los colores del tema actual (claro/oscuro) — de app/state/ThemeContext.tsx
import { BorderRadius, BorderWidth, ComponentSizes, FontWeight, TextStyles } from '../../../constants/theme'; // Importa tokens de diseño: BorderRadius (radios), BorderWidth (anchos de borde), ComponentSizes (alturas), FontWeight (pesos), TextStyles (estilos de texto predefinidos) — de app/constants/theme.ts

interface InputProps extends TextInputProps { // Define la interfaz InputProps extendiendo todas las props nativas de TextInput — inicio del bloque de tipos
  label?: string; // label: texto de etiqueta que aparece encima del campo — opcional
  error?: string; // error: mensaje de error que resalta el borde en rojo y aparece debajo del campo — opcional
  hint?: string; // hint: texto de ayuda que aparece debajo del campo solo cuando no hay error — opcional
  leftIcon?: keyof typeof Ionicons.glyphMap; // leftIcon: nombre válido de ícono Ionicons para mostrar a la izquierda del texto — opcional
  rightIcon?: keyof typeof Ionicons.glyphMap; // rightIcon: nombre válido de ícono Ionicons para mostrar a la derecha (solo si isPassword=false) — opcional
  onRightIconPress?: () => void; // onRightIconPress: función ejecutada al presionar el ícono derecho — opcional
  isPassword?: boolean; // isPassword: si true muestra el toggle de ojo para mostrar/ocultar contraseña — opcional, default false
  containerStyle?: ViewStyle; // containerStyle: estilos adicionales para el contenedor externo View — opcional
  size?: 'sm' | 'md' | 'lg'; // size: controla la altura y padding del campo; sm=pequeño, md=mediano, lg=grande — opcional, default 'md'
  accentColor?: string; // accentColor: color fijo del borde e ícono al enfocar; si se omite usa el acento del tema activo — opcional
} // Cierra la interfaz InputProps

function InputBase({ // Define el componente funcional interno InputBase (se exportará envuelto en React.memo) — inicio del componente
  label, // Desestructura prop: texto de etiqueta
  error, // Desestructura prop: mensaje de error
  hint, // Desestructura prop: texto de ayuda
  leftIcon, // Desestructura prop: ícono izquierdo
  rightIcon, // Desestructura prop: ícono derecho
  onRightIconPress, // Desestructura prop: acción del ícono derecho
  isPassword = false,
  containerStyle,
  size = 'md',
  accentColor,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const C = useColors();
  const accent = accentColor ?? C.primary; // Usa el color fijo si se pasa, si no el acento del tema
  const sizeTokens = ComponentSizes.input[size];

  return ( // Retorna el árbol JSX del componente Input
    <View style={[styles.container, containerStyle]}>{/* Contenedor externo: aplica marginBottom base y estilos personalizados opcionales */}
      {label && <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>}{/* Muestra la etiqueta encima del campo solo si la prop label existe; usa color secundario del tema actual */}
      <View // Contenedor del campo de texto con íconos
        style={[ // Combina estilos condicionalmente
          styles.inputWrapper, // Estilo base: fila horizontal, centrado, fondo, borde y overflow
          { height: sizeTokens.height, backgroundColor: C.inputBg }, // Altura según tamaño y color de fondo del tema
          focused && [styles.inputFocused, { backgroundColor: C.surface, borderColor: accent, shadowColor: accent }],
          error ? styles.inputError : null, // Si hay error: aplica borde rojo y fondo rosado claro
        ]}
      >{/* Cierra apertura del View wrapper del input */}
        {leftIcon && ( // Renderiza el ícono izquierdo solo si la prop leftIcon existe
          <Ionicons
            name={leftIcon} // Nombre del ícono Ionicons a renderizar (ej: 'person-outline', 'mail-outline')
            size={18} // Tamaño del ícono: 18px
            color={focused ? accent : C.textSecondary}
            style={styles.leftIcon} // Aplica margen izquierdo y centrado vertical al ícono
          />
        )}{/* Cierra bloque condicional del leftIcon */}
        <TextInput
          style={[ // Combina estilos del campo de texto
            styles.input, // Estilo base: flex 1, stretch vertical, fontSize 15
            { paddingHorizontal: sizeTokens.paddingHorizontal, color: C.textPrimary }, // Padding horizontal según tamaño y color de texto del tema
            leftIcon ? styles.inputWithLeft : null, // Si hay ícono izquierdo: agrega paddingLeft extra para no solaparse con el ícono
          ]}
          placeholderTextColor={C.textHint} // Color del placeholder: tono gris suave del tema para no confundirse con texto real
          secureTextEntry={isPassword && !showPassword} // Oculta el texto como puntos si isPassword=true Y showPassword=false
          autoCapitalize="none" // Desactiva la capitalización automática (importante para emails y contraseñas)
          textAlignVertical="center" // Centra el texto verticalmente dentro del campo (especialmente en Android)
          onFocus={() => setFocused(true)} // Cuando el campo recibe foco: activa el estado focused para cambiar estilos
          onBlur={() => setFocused(false)} // Cuando el campo pierde el foco: desactiva el estado focused
          {...props} // Pasa todas las props restantes de TextInput (placeholder, value, onChangeText, keyboardType, etc.)
        />{/* Cierra TextInput */}
        {isPassword && ( // Renderiza el toggle de visibilidad solo si isPassword=true
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.rightIcon}>{/* Botón táctil: alterna showPassword entre true/false al presionar; usa padding estilo rightIcon */}
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} // Ícono dinámico: ojo cerrado si showPassword=true (contraseña visible), ojo abierto si showPassword=false
              size={20} // Tamaño del ícono de visibilidad: 20px
              color={focused ? accent : C.textSecondary}
            />
          </TouchableOpacity> // Cierra TouchableOpacity del toggle de contraseña
        )}{/* Cierra bloque condicional de isPassword */}
        {rightIcon && !isPassword && ( // Renderiza el ícono derecho personalizado solo si rightIcon existe Y no es campo de contraseña (evita conflicto con el toggle)
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>{/* Botón táctil: ejecuta onRightIconPress al presionar; usa padding estilo rightIcon */}
            <Ionicons name={rightIcon} size={20} color={C.textSecondary} />{/* Muestra el ícono derecho personalizado en color secundario del tema */}
          </TouchableOpacity> // Cierra TouchableOpacity del rightIcon personalizado
        )}{/* Cierra bloque condicional de rightIcon */}
      </View>{/* Cierra View wrapper del input */}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}{/* Muestra el texto de ayuda solo si hint existe Y no hay error (el error tiene prioridad visual) */}
      {error && <Text style={styles.errorText}>{error}</Text>}{/* Muestra el mensaje de error debajo del campo solo si error existe */}
    </View> // Cierra View contenedor principal del componente
  );
} // Cierra la función InputBase

export const Input = React.memo(InputBase); // Exporta el componente envuelto en React.memo: evita re-renders si las props no cambian — para uso en toda la app

const styles = StyleSheet.create({ // Crea la hoja de estilos optimizada nativa — inicio del objeto de estilos
  container: { // Estilo del contenedor externo del componente
    marginBottom: 4, // Línea 123 — separa el componente del siguiente elemento con 4px de margen inferior
  }, // Cierra estilo container
  label: { // Estilo de la etiqueta de texto encima del campo
    ...TextStyles.label, // Línea 126 — aplica estilos predefinidos de etiqueta del design system (fontSize, fontWeight)
    color: Colors.textSecondary, // Línea 127 — color de texto secundario (gris) como fallback estático
    marginBottom: 6, // Línea 128 — separa la etiqueta del campo con 6px de margen inferior
  }, // Cierra estilo label
  inputWrapper: { // Estilo del contenedor que agrupa ícono izquierdo + TextInput + ícono derecho
    flexDirection: 'row', // Línea 131 — dispone los hijos en fila horizontal (ícono-input-ícono)
    alignItems: 'stretch', // Línea 132 — los hijos se estiran para ocupar toda la altura del contenedor
    backgroundColor: Colors.inputBg, // Línea 133 — fondo gris muy claro como valor estático fallback
    borderRadius: BorderRadius.md, // Línea 134 — esquinas redondeadas medianas del design system
    borderWidth: BorderWidth.medium, // Línea 135 — borde mediano del design system (normalmente 1.5px)
    borderColor: 'transparent', // Línea 136 — borde transparente por defecto (se colorea al enfocar o al haber error)
    overflow: 'hidden', // Línea 137 — recorta el contenido que sobresalga del borderRadius
  }, // Cierra estilo inputWrapper
  inputFocused: { // Estilo adicional aplicado cuando el campo tiene el foco activo
    borderColor: Colors.primary, // Línea 140 — borde se vuelve púrpura al enfocar para indicar campo activo
    backgroundColor: '#fff', // Línea 141 — fondo blanco puro al enfocar para mejor legibilidad
    shadowColor: Colors.primary, // Línea 142 — color de la sombra: púrpura para reforzar el indicador de foco
    shadowOffset: { width: 0, height: 0 }, // Línea 143 — sombra sin desplazamiento: efecto de brillo perimetral (glow)
    shadowOpacity: 0.15, // Línea 144 — sombra sutil al 15% de opacidad
    shadowRadius: 6, // Línea 145 — radio de difusión de la sombra: 6px para un glow suave
    elevation: 2, // Línea 146 — elevación Android de 2 para mostrar sombra en plataforma Android
  }, // Cierra estilo inputFocused
  inputError: { // Estilo adicional aplicado cuando hay un mensaje de error
    borderColor: Colors.error, // Línea 149 — borde se vuelve rojo del design system para indicar error
    backgroundColor: '#FFF5F5', // Línea 150 — fondo rosado muy claro para reforzar visualmente el estado de error
  }, // Cierra estilo inputError
  input: { // Estilo del TextInput propiamente dicho
    flex: 1, // Línea 153 — el input ocupa todo el espacio horizontal disponible entre los íconos
    alignSelf: 'stretch', // Línea 154 — se estira para ocupar toda la altura del contenedor padre
    paddingVertical: 0, // Línea 155 — elimina el padding vertical predeterminado para control preciso de altura
    fontSize: 15, // Línea 156 — tamaño de fuente 15px para el texto ingresado
    color: Colors.textPrimary, // Línea 157 — color de texto primario como fallback estático
  }, // Cierra estilo input
  inputWithLeft: { // Estilo adicional aplicado al TextInput cuando hay ícono izquierdo
    paddingLeft: 6, // Línea 160 — agrega 6px de padding izquierdo extra para separar el texto del ícono izquierdo
  }, // Cierra estilo inputWithLeft
  leftIcon: { // Estilo del ícono izquierdo dentro del campo
    marginLeft: 9, // Margen izquierdo de 9px (antes 14px, ajustado -5px para acercar el ícono al borde)
    alignSelf: 'center', // Línea 164 — centra verticalmente el ícono respecto al campo
  }, // Cierra estilo leftIcon
  rightIcon: { // Estilo del botón/ícono derecho (tanto el toggle de contraseña como rightIcon personalizado)
    paddingHorizontal: 12, // Línea 167 — padding horizontal de 12px para agrandar el área táctil
    alignSelf: 'center', // Línea 168 — centra verticalmente el ícono respecto al campo
    justifyContent: 'center', // Línea 169 — centra el ícono dentro de su área táctil
  }, // Cierra estilo rightIcon
  hint: { // Estilo del texto de ayuda debajo del campo
    ...TextStyles.caption, // Línea 172 — aplica estilos predefinidos de caption del design system (fontSize pequeño)
    color: Colors.textHint, // Línea 173 — color de texto hint: gris muy claro para indicar información secundaria
    marginTop: 4, // Línea 174 — separa el hint del campo con 4px de margen superior
  }, // Cierra estilo hint
  errorText: { // Estilo del texto de error debajo del campo
    ...TextStyles.caption, // Línea 177 — aplica estilos predefinidos de caption del design system
    color: Colors.error, // Línea 178 — color rojo del design system para indicar error
    marginTop: 4, // Línea 179 — separa el mensaje de error del campo con 4px de margen superior
    fontWeight: FontWeight.medium, // Línea 180 — peso de fuente medium para dar énfasis al mensaje de error
  }, // Cierra estilo errorText
}); // Cierra StyleSheet.create
