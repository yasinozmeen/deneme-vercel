import type { User } from "@supabase/supabase-js";

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) {
    return false;
  }

  const appMetadata = user.app_metadata ?? {};
  const userMetadata = (user.user_metadata as Record<string, unknown>) ?? {};

  const normalized = (value: unknown): string | null => {
    if (typeof value === "string") {
      return value.toLowerCase();
    }
    return null;
  };

  const rolesFromApp = Array.isArray(appMetadata.roles)
    ? appMetadata.roles.map((role) =>
        typeof role === "string"
          ? role.toLowerCase()
          : String(role ?? "").toLowerCase(),
      )
    : [];

  const roleCandidates = [
    normalized(appMetadata.role),
    normalized(userMetadata.role),
    normalized(userMetadata.app_role),
    normalized((userMetadata as { userType?: string }).userType),
    rolesFromApp.find(Boolean) ?? null,
  ];

  const booleanFlags = [
    appMetadata.is_admin,
    userMetadata.is_admin,
    userMetadata.admin,
  ];

  if (booleanFlags.some((flag) => flag === true)) {
    return true;
  }

  return roleCandidates.some((role) => role === "admin");
}
