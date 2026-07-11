"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useI18n } from "@/i18n/runtime";

export function LandingHeroCta() {
  const { user, ready } = useAuthUser();
  const { t } = useI18n();

  if (!ready) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-12 w-40 rounded-2xl bg-white/5" />
        <div className="h-12 w-32 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="glow-purple rounded-2xl gap-2"
          render={<Link href="/sleep" prefetch />}
        >
          {t("marketing.hero.loggedInCta")} <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-2xl"
          render={<Link href="/journal" prefetch />}
        >
          {t("marketing.hero.journalCta")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        size="lg"
        className="glow-purple rounded-2xl gap-2"
        render={<Link href="/signup" prefetch />}
      >
        {t("marketing.hero.primaryCta")} <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="rounded-2xl"
        render={<Link href="/login" prefetch />}
      >
        {t("marketing.hero.secondaryCta")}
      </Button>
    </div>
  );
}
