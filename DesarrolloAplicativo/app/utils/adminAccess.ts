/**
 * @file utils/adminAccess.ts
 * @description Decide si un usuario tiene acceso a las pantallas de admin.
 * Hoy se usa una whitelist de emails hardcodeada — cuando el backend exponga
 * un campo `role` en el modelo de usuario, solo hay que reemplazar el cuerpo
 * de `isAdmin` por `return user?.role === 'admin'`.
 */
import type { User } from '../types';

const ADMIN_EMAILS = new Set<string>([
  'aleosea777@gmail.com',
]);

export const isAdmin = (user: User | null | undefined): boolean => {
  if (!user?.email) return false;
  return ADMIN_EMAILS.has(user.email.trim().toLowerCase());
};
