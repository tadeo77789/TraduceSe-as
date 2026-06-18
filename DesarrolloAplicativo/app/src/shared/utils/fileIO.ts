/**
 * @file utils/fileIO.ts
 * @description Fallback nativo. Las APIs de descarga e input file solo
 * existen en el browser. Para soporte real en iOS/Android usar
 * `expo-file-system` + `expo-sharing` + `expo-document-picker`.
 */

export const downloadTextFile = (_filename: string, _content: string): void => {
  throw new Error('downloadTextFile solo está disponible en web por ahora');
};

export const pickTextFile = (): Promise<string | null> => {
  throw new Error('pickTextFile solo está disponible en web por ahora');
};

export const isFileIOSupported = (): boolean => false;
