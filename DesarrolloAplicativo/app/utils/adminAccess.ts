/**
 * @file utils/adminAccess.ts
 * @description Decide si un usuario tiene acceso a las pantallas de admin.
 *
 * Por ahora cualquier usuario autenticado es admin. Cuando el backend
 * exponga un campo `role` en el modelo de usuario, reemplazar el cuerpo
 * de `isAdmin` por algo como `return user?.role === 'admin'`.
 */
import type { User } from '../types';

export const isAdmin = (user: User | null | undefined): boolean => {
  return !!user;
};
