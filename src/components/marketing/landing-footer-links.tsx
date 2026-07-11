"use client";

import Link from "next/link";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useI18n } from "@/i18n/runtime";

export function LandingFooterLinks() {
  const { user, ready } = useAuthUser();
  const { t } = useI18n();

  if (!ready) return null;

  if (user) {
    return (
      <>
        <Link className="hover:text-foreground" href="/sleep">
          {t("marketing.hero.loggedInCta")}
        </Link>
        <span className="mx-2">·</span>
        <Link className="hover:text-foreground" href="/profile">
          {t("common.profile")}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link className="hover:text-foreground" href="/login">
        {t("auth.signupForm.login")}
      </Link>
      <span className="mx-2">·</span>
      <Link className="hover:text-foreground" href="/signup">
        {t("marketing.hero.primaryCta")}
      </Link>
    </>
  );
}
