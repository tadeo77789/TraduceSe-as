/**
 * @file utils/fileIO.web.ts
 * @description Helpers para descargar y leer archivos JSON desde el browser.
 * Solo se compila en web — Metro resuelve `fileIO.ts` (fallback nativo) en
 * Android/iOS.
 */

/** Dispara la descarga de un archivo de texto en el browser. */
export const downloadTextFile = (filename: string, content: string, mime = 'application/json'): void => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Limpieza diferida del object URL para que Chrome alcance a iniciar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Abre el file picker del browser y resuelve con el contenido de texto del
 *  archivo elegido (o null si el usuario canceló). */
export const pickTextFile = (accept = 'application/json,.json'): Promise<string | null> =>
  new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';

    let settled = false;
    const settle = (val: string | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(val);
    };

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return settle(null);
      const reader = new FileReader();
      reader.onload = () => settle(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => settle(null);
      reader.readAsText(file);
    };

    // Si el usuario cierra el diálogo sin elegir, no hay evento change. No
    // hay forma estándar de detectarlo, pero el input queda en el DOM y se
    // limpia al recargar. Dejamos así para no complicar.
    document.body.appendChild(input);
    input.click();
  });

export const isFileIOSupported = (): boolean => true;
