/**
 * @file utils/dialogs.web.ts
 * @description Wrapper de SweetAlert2 para web. Expone una API mínima que
 * cubre los casos del proyecto: alert simple, success, error, confirm y
 * choice (botones múltiples). Metro carga este archivo solo en web; en
 * nativo se resuelve `dialogs.ts` (fallback a Alert.alert).
 */
import Swal, { type SweetAlertIcon } from 'sweetalert2';

const PRIMARY = '#7C3AED';
const DANGER = '#DC2626';
const NEUTRAL = '#9CA3AF';

interface AlertOptions {
  title?: string;
  message?: string;
  icon?: SweetAlertIcon;
}

interface ConfirmOptions extends AlertOptions {
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export interface ChoiceOption {
  key: string;
  label: string;
  destructive?: boolean;
}

interface ChoiceDialogOptions extends AlertOptions {
  choices: ChoiceOption[];
  cancelText?: string;
}

export const showAlert = async (opts: AlertOptions): Promise<void> => {
  await Swal.fire({
    title: opts.title || '',
    text: opts.message || '',
    icon: opts.icon,
    confirmButtonColor: PRIMARY,
  });
};

export const showSuccess = (message: string, title = ''): Promise<void> =>
  showAlert({ title, message, icon: 'success' });

export const showError = (message: string, title = ''): Promise<void> =>
  showAlert({ title, message, icon: 'error' });

export const showInfo = (message: string, title = ''): Promise<void> =>
  showAlert({ title, message, icon: 'info' });

export const showConfirm = async (opts: ConfirmOptions): Promise<boolean> => {
  const res = await Swal.fire({
    title: opts.title || '',
    text: opts.message || '',
    icon: opts.icon ?? (opts.destructive ? 'warning' : 'question'),
    showCancelButton: true,
    confirmButtonText: opts.confirmText || 'OK',
    cancelButtonText: opts.cancelText || 'Cancelar',
    confirmButtonColor: opts.destructive ? DANGER : PRIMARY,
    cancelButtonColor: NEUTRAL,
    reverseButtons: true,
    focusCancel: opts.destructive,
  });
  return res.isConfirmed;
};

/** Diálogo con botones múltiples. Devuelve la `key` elegida o null si canceló. */
export const showChoice = async (opts: ChoiceDialogOptions): Promise<string | null> => {
  if (opts.choices.length === 0) return null;

  // SweetAlert2 nativamente soporta confirm + deny + cancel (3 botones).
  // Si hay 2 opciones las mapeamos a confirm/deny; si hay más, caemos a un
  // diálogo HTML con botones inline.
  if (opts.choices.length <= 2) {
    const [first, second] = opts.choices;
    const res = await Swal.fire({
      title: opts.title || '',
      text: opts.message || '',
      icon: opts.icon ?? 'question',
      showCancelButton: true,
      showDenyButton: !!second,
      confirmButtonText: first.label,
      denyButtonText: second?.label,
      cancelButtonText: opts.cancelText || 'Cancelar',
      confirmButtonColor: first.destructive ? DANGER : PRIMARY,
      denyButtonColor: second?.destructive ? DANGER : PRIMARY,
      cancelButtonColor: NEUTRAL,
      reverseButtons: true,
    });
    if (res.isConfirmed) return first.key;
    if (res.isDenied && second) return second.key;
    return null;
  }

  // Más de 2 opciones: render HTML personalizado.
  const buttonsHtml = opts.choices
    .map((c, i) => {
      const bg = c.destructive ? DANGER : PRIMARY;
      return `<button data-key="${c.key}" data-idx="${i}" style="background:${bg};color:#fff;border:none;padding:10px 18px;border-radius:8px;font-weight:700;cursor:pointer;margin:4px;">${c.label}</button>`;
    })
    .join('');

  return new Promise<string | null>(resolve => {
    Swal.fire({
      title: opts.title || '',
      text: opts.message || '',
      icon: opts.icon ?? 'question',
      html: `<div style="display:flex;flex-direction:column;gap:6px;align-items:center;margin-top:10px;">${buttonsHtml}</div>`,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: opts.cancelText || 'Cancelar',
      cancelButtonColor: NEUTRAL,
      didOpen: () => {
        const popup = Swal.getPopup();
        popup?.querySelectorAll<HTMLButtonElement>('button[data-key]').forEach(btn => {
          btn.addEventListener('click', () => {
            Swal.close();
            resolve(btn.dataset.key ?? null);
          });
        });
      },
    }).then(res => {
      if (res.dismiss) resolve(null);
    });
  });
};

export const dialogsSupported = (): boolean => true;
