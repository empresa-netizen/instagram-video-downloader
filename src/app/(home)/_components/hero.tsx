import React from "react";

import { useTranslations } from "next-intl";

import { ArrowDown } from "lucide-react";

import { homeLinks, homeSections } from "@/lib/constants";
import { InstagramForm } from "@/components/instagram-form";
import { LogoImage } from "@/components/logo";
import { SessionStatus } from "@/components/session-status";

export function Hero() {
  const t = useTranslations("pages.home.hero");

  return (
    <section
      id={homeSections.hero}
      className="relative w-full scroll-mt-16 overflow-hidden py-16 md:py-24 lg:py-28"
    >
      <SessionStatus />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 -left-24 h-72 w-72 rounded-full bg-[#A8CDB7]/25 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 translate-x-1/3 bg-[#24332D]/8 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#A8CDB7]" />
            <span className="text-xs font-bold tracking-[0.3em] text-[#6B746D] uppercase">
              Saúde · Estética · Performance
            </span>
            <span className="h-px w-10 bg-[#A8CDB7]" />
          </div>

          <LogoImage className="h-14 w-20 text-[#24332D] dark:text-[#F6F5F0]" />

          <div className="max-w-4xl space-y-4 text-balance">
            <h1 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-[700px] text-base leading-relaxed text-[#4a564f] md:text-xl dark:text-[#CFC9BE]">
              {t("description")}
            </p>
          </div>

          <InstagramForm className="w-full max-w-xl" />

          <div className="mt-4">
            <a href={homeLinks.howItWorks} className="group inline-flex flex-col items-center">
              <div className="mb-2 text-sm font-semibold text-[#6B746D] transition-colors group-hover:text-[#24332D] dark:group-hover:text-[#A8CDB7]">
                {t("learnMore")}
              </div>
              <ArrowDown className="mx-auto h-6 w-6 animate-bounce text-[#A8CDB7]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
