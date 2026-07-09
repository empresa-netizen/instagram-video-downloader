import React from "react";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("layouts.home.footer");

  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#E4E1D8] bg-[#EDEAE1] py-6 md:py-0 dark:border-white/10 dark:bg-[#1a2420]">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row md:px-6">
        <p className="text-muted-foreground text-sm">
          {t("copyright", { year })}
        </p>
        <div className="flex gap-4">
          <a
            href="#"
            className="text-muted-foreground text-sm hover:text-[#24332D] dark:hover:text-[#A8CDB7]"
          >
            {t("links.terms")}
          </a>
          <a
            href="#"
            className="text-muted-foreground text-sm hover:text-[#24332D] dark:hover:text-[#A8CDB7]"
          >
            {t("links.privacy")}
          </a>
          <a
            href="#"
            className="text-muted-foreground text-sm hover:text-[#24332D] dark:hover:text-[#A8CDB7]"
          >
            {t("links.contact")}
          </a>
        </div>
      </div>
    </footer>
  );
}
