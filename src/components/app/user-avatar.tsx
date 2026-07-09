"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  className?: string;
  fallbackClassName?: string;
  size?: "default" | "sm" | "lg";
}

export function UserAvatar({
  avatarUrl,
  displayName,
  email,
  className,
  fallbackClassName,
  size = "default",
}: UserAvatarProps) {
  const initials = getUserInitials(email, displayName);
  const alt = displayName ?? email ?? "Profil";

  return (
    <Avatar className={className} size={size}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={alt} /> : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}
