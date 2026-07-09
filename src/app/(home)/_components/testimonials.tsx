import React from "react";

import { useTranslations } from "next-intl";

import { homeSections } from "@/lib/constants";

export function Testimonials() {
  const t = useTranslations("pages.home.testimonials");

  return (
    <section
      id={homeSections.testimonials}
      className="w-full bg-[#24332D] py-12 text-[#F6F5F0] md:py-24"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl tracking-tight md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-[700px] text-[#CFC9BE] md:text-xl">
              {t("description")}
            </p>
          </div>
          <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col items-center border border-white/10 bg-[#2d3d36] p-4 transition-all duration-200 hover:-translate-y-1 sm:p-6">
              <span className="text-3xl font-extrabold text-[#A8CDB7] sm:text-4xl">
                50K+
              </span>
              <span className="text-sm text-[#CFC9BE] sm:text-base">
                {t("stats.downloads")}
              </span>
            </div>
            <div className="flex flex-col items-center border border-white/10 bg-[#2d3d36] p-4 transition-all duration-200 hover:-translate-y-1 sm:p-6">
              <span className="text-3xl font-extrabold text-[#A8CDB7] sm:text-4xl">
                100K+
              </span>
              <span className="text-sm text-[#CFC9BE] sm:text-base">
                {t("stats.users")}
              </span>
            </div>
            <div className="flex flex-col items-center border border-white/10 bg-[#2d3d36] p-4 transition-all duration-200 hover:-translate-y-1 sm:p-6">
              <span className="text-3xl font-extrabold text-[#A8CDB7] sm:text-4xl">
                4.9/5
              </span>
              <span className="text-sm text-[#CFC9BE] sm:text-base">
                {t("stats.rating")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
