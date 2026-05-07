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
      <View style={styles.fieldRow}>{/* Fila que agrupa el ícono izquierdo (caja externa) y el wrapper del input como elementos hermanos */}
        {leftIcon && ( // Renderiza el ícono izquierdo como una caja independiente fuera del input
          <View
            style={[
              styles.leftIconBox, // Caja base: dimensiones, bordes, fondo y centrado
              { height: sizeTokens.height, width: sizeTokens.height, backgroundColor: C.inputBg }, // Cuadrada del mismo alto que el input y fondo del tema
              focused && [styles.leftIconBoxFocused, { backgroundColor: C.surface, borderColor: accent, shadowColor: accent }], // Resalta la caja del ícono cuando el input está enfocado
              error ? styles.leftIconBoxError : null, // Si hay error: aplica borde rojo a la caja del ícono también
            ]}
          >
            <Ionicons
              name={leftIcon} // Nombre del ícono Ionicons a renderizar (ej: 'person-outline', 'mail-outline', 'lock-closed-outline')
              size={20} // Tamaño del ícono: 20px (un poco mayor porque ocupa todo el cuadro)
              color={focused ? accent : C.textSecondary} // Toma el color de acento al enfocar; secundario en reposo
            />
          </View>
        )}{/* Cierra bloque condicional del leftIcon externo */}
        <View // Contenedor del campo de texto con ícono derecho
          style={[ // Combina estilos condicionalmente
            styles.inputWrapper, // Estilo base: fila horizontal, centrado, fondo, borde y overflow
            { height: sizeTokens.height, backgroundColor: C.inputBg }, // Altura según tamaño y color de fondo del tema
            { flex: 1 }, // Ocupa el espacio restante de la fila después de la caja del ícono externo
            leftIcon ? styles.inputWrapperAttached : null, // Si hay ícono externo: pega el wrapper al ícono (sin redondeo izquierdo y sin borde izquierdo) para formar una sola barra
            focused && [styles.inputFocused, { backgroundColor: C.surface, borderColor: accent, shadowColor: accent }],
            error ? styles.inputError : null, // Si hay error: aplica borde rojo y fondo rosado claro
          ]}
        >{/* Cierra apertura del View wrapper del input */}
          <TextInput
            style={[ // Combina estilos del campo de texto
              styles.input, // Estilo base: flex 1, stretch vertical, fontSize 15
              { paddingHorizontal: sizeTokens.paddingHorizontal, color: C.textPrimary }, // Padding horizontal según tamaño y color de texto del tema
              (isPassword || rightIcon) ? styles.inputWithRight : null, // Si hay ícono derecho (toggle de contraseña o personalizado): agrega paddingRight extra para que el texto no quede pegado al ícono
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
      </View>{/* Cierra fieldRow */}
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
  fieldRow: { // Fila externa que agrupa la caja del ícono izquierdo y el wrapper del input pegados como una sola barra
    flexDirection: 'row', // Coloca el ícono y el wrapper como columnas en una sola fila
    alignItems: 'stretch', // Que ambos elementos compartan la misma altura
  }, // Cierra estilo fieldRow
  leftIconBox: { // Caja del ícono izquierdo: zona visual del ícono pegada al input (juntos forman una sola barra)
    alignItems: 'center', // Centra el ícono horizontalmente dentro del cuadrado
    justifyContent: 'center', // Centra el ícono verticalmente dentro del cuadrado
    borderTopLeftRadius: BorderRadius.md, // Esquina superior izquierda redondeada (extremo izquierdo de la barra)
    borderBottomLeftRadius: BorderRadius.md, // Esquina inferior izquierda redondeada (extremo izquierdo de la barra)
    borderTopRightRadius: 0, // Lado derecho sin redondear: queda plano contra el input para verse continuo
    borderBottomRightRadius: 0, // Lado derecho sin redondear: queda plano contra el input para verse continuo
    borderWidth: BorderWidth.medium, // Mismo grosor de borde que el input para mantener coherencia visual
    borderColor: 'transparent', // Borde transparente por defecto (se colorea al enfocar el input o al haber error)
  }, // Cierra estilo leftIconBox
  leftIconBoxFocused: { // Estilos adicionales aplicados a la caja del ícono cuando el input está enfocado
    borderColor: Colors.primary, // Borde morado para acompañar al input enfocado
    backgroundColor: '#fff', // Fondo blanco igual al input enfocado
    shadowColor: Colors.primary, // Sombra morada para reforzar el efecto de foco
    shadowOffset: { width: 0, height: 0 }, // Sombra sin desplazamiento (glow perimetral)
    shadowOpacity: 0.15, // Opacidad sutil al 15%
    shadowRadius: 6, // Difusión de 6px
    elevation: 2, // Elevación equivalente en Android
  }, // Cierra estilo leftIconBoxFocused
  leftIconBoxError: { // Estilos adicionales aplicados a la caja del ícono cuando hay un error en el input
    borderColor: Colors.error, // Borde rojo para acompañar el estado de error del input
    backgroundColor: '#FFF5F5', // Fondo rosado muy claro igual al input en error
  }, // Cierra estilo leftIconBoxError
  inputWrapper: { // Estilo del contenedor que agrupa el TextInput y el ícono derecho (el izquierdo ahora va afuera)
    flexDirection: 'row', // Dispone los hijos en fila horizontal (input-ícono derecho)
    alignItems: 'stretch', // Los hijos se estiran para ocupar toda la altura del contenedor
    backgroundColor: Colors.inputBg, // Fondo gris muy claro como valor estático fallback
    borderRadius: BorderRadius.md, // Esquinas redondeadas medianas del design system
    borderWidth: BorderWidth.medium, // Borde mediano del design system (normalmente 1.5px)
    borderColor: 'transparent', // Borde transparente por defecto (se colorea al enfocar o al haber error)
    overflow: 'hidden', // Recorta el contenido que sobresalga del borderRadius
  }, // Cierra estilo inputWrapper
  inputWrapperAttached: { // Variante aplicada cuando hay ícono externo a la izquierda: el wrapper queda pegado a la caja del ícono formando una sola barra
    borderTopLeftRadius: 0, // Sin redondeo en la esquina superior izquierda para que se funda con el ícono
    borderBottomLeftRadius: 0, // Sin redondeo en la esquina inferior izquierda para que se funda con el ícono
    borderLeftWidth: 0, // Sin borde izquierdo: evita el "doble borde" en el punto de unión con el ícono (el borde derecho del ícono actúa como divisor)
  }, // Cierra estilo inputWrapperAttached
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
  inputWithRight: { // Estilo adicional aplicado al TextInput cuando hay ícono derecho (contraseña o personalizado)
    paddingRight: 12, // Agrega 12px de padding derecho extra para que el texto/cursor no quede pegado al ícono ni al borde activo (focused)
  }, // Cierra estilo inputWithRight
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
