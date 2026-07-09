"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Moon, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/app/user-avatar";
import { useAuthUser } from "@/hooks/use-auth-user";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-display";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthUser();
  const [open, setOpen] = React.useState(false);

  const email = user?.email ?? null;
  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const goToProfile = () => {
    setOpen(false);
    if (pathname !== "/profile") {
      router.push("/profile");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full p-0",
              "touch-manipulation [-webkit-tap-highlight-color:transparent]",
              "active:scale-95 transition-transform duration-75"
            )}
            aria-label={displayName ?? "Hesap"}
          />
        }
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          displayName={displayName}
          email={email}
          className="size-9 border border-white/10 bg-primary/15"
          fallbackClassName="bg-transparent text-xs font-semibold text-white"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <UserAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            email={email}
            className="size-8 shrink-0"
            size="sm"
          />
          <div className="min-w-0">
            {displayName && displayName !== email ? (
              <p className="truncate font-medium">{displayName}</p>
            ) : null}
            <p className="truncate text-xs text-muted-foreground">{email ?? "Hesap"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={goToProfile}>
          <User />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            router.push("/sleep");
          }}
        >
          <Moon />
          Uyku paneli
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut />
          Çıkış yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
