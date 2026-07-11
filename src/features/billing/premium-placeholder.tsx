"use client";

import { useI18n } from "@/i18n/runtime";

export function PremiumPlaceholder() {
  const { t } = useI18n();
  return (
    <div className="glass rounded-3xl border border-white/10 p-6 text-center shadow-soft">
      <p className="text-sm font-medium text-primary">{t("billing.title")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t("billing.body")}</p>
    </div>
  );
}
