// Role-based permission helper for admin panel

export type AdminRole = "admin" | "superadmin";

export const ROLES = {
  ADMIN: "admin" as const,
  SUPERADMIN: "superadmin" as const,
};

// Navigation items that require superadmin
const SUPERADMIN_ONLY_ROUTES = [
  "/admin/dashboard/users",
  "/admin/dashboard/pengaturan",
];

// API routes that require superadmin
const SUPERADMIN_ONLY_API = [
  "/api/admin/users",
  "/api/admin/settings",
];

export function isSuperadmin(role?: string | null): boolean {
  return role === ROLES.SUPERADMIN;
}

export function canAccessRoute(role: string | null | undefined, pathname: string): boolean {
  if (isSuperadmin(role)) return true;
  return !SUPERADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
}

export function canAccessApi(role: string | null | undefined, pathname: string): boolean {
  if (isSuperadmin(role)) return true;
  return !SUPERADMIN_ONLY_API.some((r) => pathname.startsWith(r));
}
