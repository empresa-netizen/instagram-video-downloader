import React from "react";

import { useTranslations } from "next-intl";

import { CheckCircle, Shield, TvMinimalPlay, Zap } from "lucide-react";

import { homeSections } from "@/lib/constants";

export function Features() {
  const t = useTranslations("pages.home.features");

  const cards = [
    {
      key: "free" as const,
      icon: Shield,
    },
    {
      key: "noRegistration" as const,
      icon: CheckCircle,
    },
    {
      key: "fast" as const,
      icon: Zap,
    },
    {
      key: "hdQuality" as const,
      icon: TvMinimalPlay,
    },
  ];

  return (
    <section
      id={homeSections.features}
      className="w-full scroll-mt-12 py-12 md:py-24"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-3">
            <div className="mb-2 inline-flex items-center gap-3 text-xs font-bold tracking-[0.28em] text-[#6B746D] uppercase">
              <span className="h-px w-8 bg-[#A8CDB7]" />
              {t("badge")}
              <span className="h-px w-8 bg-[#A8CDB7]" />
            </div>
            <h2 className="font-serif text-3xl tracking-tight md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-[700px] text-[#4a564f] md:text-xl dark:text-[#CFC9BE]">
              {t("description")}
            </p>
          </div>
          <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 xl:grid-cols-4">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const isAccent = index === 1;
              return (
                <div
                  key={card.key}
                  className={
                    isAccent
                      ? "flex flex-col items-center space-y-3 border border-transparent bg-[#24332D] p-4 text-[#F6F5F0] transition-all duration-200 hover:-translate-y-1 sm:p-6"
                      : "flex flex-col items-center space-y-3 border border-[#E4E1D8] bg-white p-4 transition-all duration-200 hover:-translate-y-1 sm:p-6 dark:border-white/10 dark:bg-[#2d3d36]"
                  }
                >
                  <div
                    className={
                      isAccent
                        ? "rounded-full bg-[#A8CDB7]/20 p-3"
                        : "rounded-full bg-[#A8CDB7]/25 p-3"
                    }
                  >
                    <Icon
                      className={
                        isAccent
                          ? "h-6 w-6 text-[#A8CDB7] sm:h-8 sm:w-8"
                          : "h-6 w-6 text-[#24332D] sm:h-8 sm:w-8 dark:text-[#A8CDB7]"
                      }
                    />
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl">
                    {t(`cards.${card.key}.title`)}
                  </h3>
                  <p
                    className={
                      isAccent
                        ? "text-center text-sm text-[#CFC9BE] sm:text-base"
                        : "text-center text-sm text-[#4a564f] sm:text-base dark:text-[#CFC9BE]"
                    }
                  >
                    {t(`cards.${card.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
