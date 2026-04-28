// Archivo: app/presentation/components/common/Button.tsx — Componente de botón reutilizable con variantes, tamaños, estado de carga y animación de escala
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
import React, { useRef, useCallback } from 'react'; // Importa React y los hooks useRef (referencia mutable sin re-render) y useCallback (memoriza funciones) — de 'react'
import {
  TouchableOpacity, // Importa TouchableOpacity: área táctil con efecto de opacidad al presionar — de 'react-native'
  Text, // Importa Text: componente para mostrar texto — de 'react-native'
  StyleSheet, // Importa StyleSheet: utilidad para crear hojas de estilos optimizadas — de 'react-native'
  ActivityIndicator, // Importa ActivityIndicator: spinner de carga giratorio — de 'react-native'
  Animated, // Importa Animated: API para animaciones fluidas con driver nativo — de 'react-native'
  ViewStyle, // Importa ViewStyle: tipo TypeScript para estilos de contenedores View — de 'react-native'
  TextStyle, // Importa TextStyle: tipo TypeScript para estilos de componentes Text — de 'react-native'
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Importa LinearGradient: componente que dibuja un degradado lineal de colores — de 'expo-linear-gradient'
import { Colors } from '../../../constants/colors'; // Importa Colors: paleta de colores centralizada del design system — de app/constants/colors.ts
import { BorderRadius, ComponentSizes, FontWeight, Shadows } from '../../../constants/theme'; // Importa tokens de diseño: BorderRadius (radios de borde), ComponentSizes (alturas y paddings), FontWeight (pesos de fuente), Shadows (sombras) — de app/constants/theme.ts

interface ButtonProps { // Define la interfaz TypeScript con todas las props que acepta el botón — inicio del bloque de tipos
  title: string; // title: texto visible en el botón — tipo string, obligatorio
  onPress: () => void; // onPress: función sin argumentos ni retorno que se ejecuta al presionar — obligatoria
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'; // variant: controla el estilo visual; primary=degradado, secondary=fondo claro con borde, danger=rojo, outline=solo borde, ghost=transparente — opcional, default 'primary'
  size?: 'sm' | 'md' | 'lg'; // size: controla la altura y padding del botón; sm=pequeño, md=mediano, lg=grande — opcional, default 'md'
  loading?: boolean; // loading: si true muestra un spinner y bloquea la interacción — opcional, default false
  disabled?: boolean; // disabled: si true deshabilita el botón visualmente y funcionalmente — opcional, default false
  style?: ViewStyle; // style: estilos adicionales del contenedor exterior, se fusionan con los internos — opcional
  textStyle?: TextStyle; // textStyle: estilos adicionales para el texto del botón, se fusionan con los internos — opcional
  fullWidth?: boolean; // fullWidth: si true el botón se extiende al 100% del ancho del padre — opcional, default false
} // Cierra la interfaz ButtonProps

function ButtonBase({ // Define el componente funcional interno ButtonBase (se exportará envuelto en React.memo) — inicio del componente
  title, // Desestructura prop: texto del botón
  onPress, // Desestructura prop: función al presionar
  variant = 'primary', // Desestructura prop con valor por defecto: variante visual = 'primary'
  size = 'md', // Desestructura prop con valor por defecto: tamaño = 'md'
  loading = false, // Desestructura prop con valor por defecto: sin estado de carga
  disabled = false, // Desestructura prop con valor por defecto: habilitado
  style, // Desestructura prop: estilos extra del contenedor
  textStyle, // Desestructura prop: estilos extra del texto
  fullWidth = false, // Desestructura prop con valor por defecto: no ocupa ancho completo
}: ButtonProps) { // Tipado del parámetro con la interfaz ButtonProps — cierra la firma del componente
  const isDisabled = disabled || loading; // Calcula si el botón debe estar deshabilitado: true cuando disabled=true O loading=true
  const sizeTokens = ComponentSizes.button[size]; // Obtiene los tokens de tamaño (height, paddingHorizontal) según la prop size desde el design system
  const scaleAnim = useRef(new Animated.Value(1)).current; // Crea un valor animado inicial en 1 (escala normal) usando useRef para persistirlo sin causar re-renders

  const handlePressIn = useCallback(() => { // Define con useCallback la función que anima el botón al comenzar a presionar — memorizada para evitar recreación
    Animated.spring(scaleAnim, { // Inicia una animación tipo resorte sobre scaleAnim — da sensación de presión física
      toValue: 0.97, // Reduce la escala al 97%: efecto de hundimiento leve al presionar
      useNativeDriver: true, // Usa el driver nativo para mejor rendimiento (sin pasar por JS en cada frame)
      speed: 50, // Velocidad alta de la animación: reacción inmediata al toque
      bounciness: 0, // Sin rebote: la escala baja suavemente sin oscilar
    }).start(); // Inicia la animación inmediatamente
  }, [scaleAnim]); // Dependencia: solo se recrea si scaleAnim cambia (nunca cambia en la práctica)

  const handlePressOut = useCallback(() => { // Define con useCallback la función que anima el botón al soltar — memorizada para evitar recreación
    Animated.spring(scaleAnim, { // Inicia animación resorte de regreso a escala normal
      toValue: 1, // Regresa la escala al 100%: botón vuelve a su tamaño original
      useNativeDriver: true, // Usa el driver nativo para mejor rendimiento
      speed: 30, // Velocidad moderada: regreso más suave que la bajada
      bounciness: 4, // Rebote leve al soltar: da sensación de elasticidad natural
    }).start(); // Inicia la animación inmediatamente
  }, [scaleAnim]); // Dependencia: solo se recrea si scaleAnim cambia

  if (variant === 'primary') { // Rama condicional: si la variante es 'primary' renderiza el botón con degradado LinearGradient
    return ( // Retorna el JSX del botón primario con gradiente
      <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale: scaleAnim }] }]}>{/* Contenedor animado: aplica width 100% si fullWidth=true y transforma la escala con scaleAnim para el efecto de presión */}
        <TouchableOpacity
          onPress={onPress} // Ejecuta la función onPress al soltar el toque
          onPressIn={handlePressIn} // Ejecuta handlePressIn al inicio del toque: inicia animación de hundimiento
          onPressOut={handlePressOut} // Ejecuta handlePressOut al soltar: inicia animación de regreso
          disabled={isDisabled} // Deshabilita la interacción si isDisabled=true
          activeOpacity={0.9} // Opacidad al presionar: 90%, efecto sutil de retroalimentación visual
          style={[isDisabled && styles.disabled, style]} // Aplica opacidad reducida si está deshabilitado; fusiona con style externo
        >{/* Cierra apertura de TouchableOpacity */}
          <LinearGradient
            colors={Colors.gradientPrimaryDeep} // Array de colores del degradado: tonos púrpura profundos desde Colors
            start={{ x: 0, y: 0 }} // El degradado comienza en la esquina superior izquierda
            end={{ x: 1, y: 1 }} // El degradado termina en la esquina inferior derecha (diagonal)
            style={[ // Aplica estilos combinados al contenedor del gradiente
              styles.gradientBase, // Estilo base: borderRadius, centrado y sombra
              { height: sizeTokens.height, paddingHorizontal: sizeTokens.paddingHorizontal }, // Altura y padding horizontal según el tamaño elegido
            ]}
          >{/* Cierra apertura de LinearGradient */}
            {loading ? ( // Condición: si loading=true muestra spinner, si no muestra el texto
              <ActivityIndicator color="#fff" size="small" /> // Spinner blanco pequeño mientras se procesa la acción
            ) : (
              <Text style={[styles.text, styles.primaryText, textStyle]}>{title}</Text> // Texto del botón con estilo base, color blanco (primaryText) y estilos extra opcionales
            )}
          </LinearGradient>{/* Cierra LinearGradient */}
        </TouchableOpacity>{/* Cierra TouchableOpacity del botón primary */}
      </Animated.View> // Cierra Animated.View del botón primary
    );
  } // Cierra rama condicional variant === 'primary'

  return ( // Retorna el JSX para las variantes no-primary (secondary, danger, outline, ghost)
    <Animated.View style={[fullWidth && styles.fullWidth, { transform: [{ scale: scaleAnim }] }]}>{/* Contenedor animado: aplica width 100% si fullWidth=true y la animación de escala */}
      <TouchableOpacity
        style={[ // Combina múltiples estilos en orden de precedencia
          styles.base, // Estilo base: borderRadius, centrado
          styles[variant], // Estilo específico de la variante (secondary/danger/outline/ghost)
          { height: sizeTokens.height, paddingHorizontal: sizeTokens.paddingHorizontal }, // Dimensiones según el tamaño
          fullWidth && styles.fullWidth, // width 100% si fullWidth=true
          isDisabled && styles.disabled, // Opacidad 0.5 si está deshabilitado
          style, // Estilos personalizados externos (mayor precedencia)
        ]}
        onPress={onPress} // Ejecuta la función onPress al soltar el toque
        onPressIn={handlePressIn} // Inicia animación de hundimiento al comenzar el toque
        onPressOut={handlePressOut} // Regresa a escala normal al soltar el toque
        disabled={isDisabled} // Deshabilita la interacción cuando isDisabled=true
        activeOpacity={0.9} // Opacidad 90% al presionar para retroalimentación visual sutil
      >{/* Cierra apertura de TouchableOpacity de variantes no-primary */}
        {loading ? ( // Condición: spinner si loading=true, texto si loading=false
          <ActivityIndicator color={Colors.primary} size="small" /> // Spinner en color primario (púrpura) para variantes que no son blancas
        ) : (
          <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles], textStyle]}>{/* Texto con estilo base, color dinámico según variante (ej: 'secondaryText') y estilos extra */}
            {title}{/* Muestra el texto del botón recibido por prop */}
          </Text>
        )}
      </TouchableOpacity>{/* Cierra TouchableOpacity de variantes no-primary */}
    </Animated.View> // Cierra Animated.View de variantes no-primary
  );
} // Cierra la función ButtonBase

export const Button = React.memo(ButtonBase); // Exporta el componente envuelto en React.memo: evita re-renders si las props no cambian — para uso en toda la app

const styles = StyleSheet.create({ // Crea la hoja de estilos optimizada nativa — inicio del objeto de estilos
  base: { // Estilo base compartido por todas las variantes no-primary
    borderRadius: BorderRadius.md, // Línea 141 — aplica radio de borde mediano (esquinas redondeadas moderadas)
    alignItems: 'center', // Línea 142 — centra los hijos horizontalmente dentro del botón
    justifyContent: 'center', // Línea 143 — centra los hijos verticalmente dentro del botón
  }, // Cierra estilo base
  gradientBase: { // Estilo del contenedor LinearGradient del botón primary
    borderRadius: BorderRadius.md, // Línea 146 — aplica radio de borde mediano al gradiente para igualar al botón
    alignItems: 'center', // Línea 147 — centra horizontalmente el spinner o texto dentro del gradiente
    justifyContent: 'center', // Línea 148 — centra verticalmente el spinner o texto dentro del gradiente
    ...Shadows.primary, // Línea 149 — aplica sombra del design system: efecto de elevación con color primario
  }, // Cierra estilo gradientBase
  fullWidth: { // Estilo aplicado cuando prop fullWidth=true
    width: '100%', // Línea 152 — hace que el botón ocupe todo el ancho disponible del padre
  }, // Cierra estilo fullWidth
  primary: { // Estilo de variante 'primary' (sin gradiente, como fallback)
    backgroundColor: Colors.primary, // Línea 155 — fondo color primario púrpura (#7C3AED)
  }, // Cierra estilo primary
  secondary: { // Estilo de variante 'secondary': fondo claro con borde
    backgroundColor: Colors.primaryBg, // Línea 158 — fondo lavanda muy claro del design system
    borderWidth: 1.5, // Línea 159 — aplica borde de 1.5px de grosor
    borderColor: Colors.primaryLighter, // Línea 160 — borde en tono púrpura claro del design system
  }, // Cierra estilo secondary
  danger: { // Estilo de variante 'danger': botón de acción destructiva
    backgroundColor: Colors.danger, // Línea 163 — fondo rojo de peligro/error del design system
  }, // Cierra estilo danger
  outline: { // Estilo de variante 'outline': solo borde visible, sin relleno
    backgroundColor: 'transparent', // Línea 166 — fondo completamente transparente
    borderWidth: 1.5, // Línea 167 — borde de 1.5px de grosor
    borderColor: Colors.primary, // Línea 168 — borde en color primario púrpura
  }, // Cierra estilo outline
  ghost: { // Estilo de variante 'ghost': sin fondo ni borde, solo texto
    backgroundColor: 'transparent', // Línea 171 — fondo completamente transparente, sin ningún borde
  }, // Cierra estilo ghost
  disabled: { // Estilo aplicado cuando el botón está deshabilitado o cargando
    opacity: 0.5, // Línea 174 — reduce la opacidad al 50% para indicar visualmente que está inactivo
  }, // Cierra estilo disabled
  text: { // Estilo base del texto para todas las variantes
    fontSize: 15, // Línea 177 — tamaño de fuente 15px para el texto del botón
    fontWeight: FontWeight.bold, // Línea 178 — peso de fuente bold (negrita) del design system
    letterSpacing: 0.3, // Línea 179 — espaciado entre letras de 0.3px para mejor legibilidad
  }, // Cierra estilo text
  primaryText:   { color: '#fff' }, // Color del texto en variante 'primary': blanco puro para contraste sobre el fondo púrpura
  secondaryText: { color: Colors.primary }, // Color del texto en variante 'secondary': púrpura primario sobre fondo claro
  dangerText:    { color: '#fff' }, // Color del texto en variante 'danger': blanco puro sobre fondo rojo
  outlineText:   { color: Colors.primary }, // Color del texto en variante 'outline': púrpura primario sobre fondo transparente
  ghostText:     { color: Colors.primary }, // Color del texto en variante 'ghost': púrpura primario sobre fondo transparente
}); // Cierra StyleSheet.create
