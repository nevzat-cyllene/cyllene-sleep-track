import type { User } from "@supabase/supabase-js";

type UserMeta = Record<string, unknown>;

function meta(user: Pick<User, "user_metadata"> | null | undefined): UserMeta {
  return (user?.user_metadata ?? {}) as UserMeta;
}

export function getUserAvatarUrl(
  user: Pick<User, "user_metadata"> | null | undefined
): string | null {
  const url = meta(user).avatar_url ?? meta(user).picture;
  return typeof url === "string" && url.length > 0 ? url : null;
}

export function getUserDisplayName(
  user: Pick<User, "user_metadata" | "email"> | null | undefined
): string | null {
  const name = meta(user).full_name ?? meta(user).name;
  if (typeof name === "string" && name.trim().length > 0) return name.trim();
  return user?.email ?? null;
}

export function getUserInitials(
  email: string | null | undefined,
  displayName: string | null | undefined
): string {
  if (displayName && !displayName.includes("@")) {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  return email?.split("@")[0]?.slice(0, 2)?.toUpperCase() ?? "U";
}
