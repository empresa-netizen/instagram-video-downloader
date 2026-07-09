import React from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import { Copy, Download, Clipboard } from "lucide-react";

import { homeLinks, homeSections } from "@/lib/constants";

export function HowItWorks() {
  const t = useTranslations("pages.home.howItWorks");

  return (
    <section
      id={homeSections.howItWorks}
      className="w-full scroll-mt-12 py-12 md:py-24"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-2">
            <div className="mb-2 inline-flex items-center gap-3 text-xs font-bold tracking-[0.28em] text-[#6B746D] uppercase">
              {t("badge")}
            </div>
            <h2 className="font-serif text-3xl tracking-tight md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-[700px] text-[#4a564f] md:text-xl dark:text-[#CFC9BE]">
              {t("description")}
            </p>
          </div>

          {/* Desktop version */}
          <div className="relative mx-auto mt-12 hidden w-full max-w-4xl md:block">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative flex flex-col items-center space-y-4">
                <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#24332D] text-xl font-bold text-[#F6F5F0]">
                  1
                </div>
                <div className="h-full border border-[#E4E1D8] bg-white p-6 transition-all duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#2d3d36]">
                  <div className="mb-4 flex justify-center">
                    <Copy className="h-8 w-8 text-[#A8CDB7]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl">
                    {t("steps.copy.title")}
                  </h3>
                  <p className="text-[#4a564f] dark:text-[#CFC9BE]">
                    {t("steps.copy.descriptionDesktop")}
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col items-center space-y-4">
                <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#24332D] text-xl font-bold text-[#F6F5F0]">
                  2
                </div>
                <div className="h-full border border-[#E4E1D8] bg-white p-6 transition-all duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#2d3d36]">
                  <div className="mb-4 flex justify-center">
                    <Clipboard className="h-8 w-8 text-[#A8CDB7]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl">
                    {t("steps.paste.title")}
                  </h3>
                  <p className="text-[#4a564f] dark:text-[#CFC9BE]">
                    {t("steps.paste.descriptionDesktop")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#24332D] text-xl font-bold text-[#F6F5F0]">
                  3
                </div>
                <div className="h-full border border-[#E4E1D8] bg-white p-6 transition-all duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#2d3d36]">
                  <div className="mb-4 flex justify-center">
                    <Download className="h-8 w-8 text-[#A8CDB7]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl">
                    {t("steps.download.title")}
                  </h3>
                  <p className="text-[#4a564f] dark:text-[#CFC9BE]">
                    {t("steps.download.descriptionDesktop")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile version with vertical steps */}
          <div className="relative mx-auto w-full max-w-sm space-y-8 md:hidden">
            {/* Vertical connecting line */}
            <div className="absolute top-0 bottom-16 left-4 w-0.5 bg-[#A8CDB7]/60"></div>

            <div className="relative flex items-start space-x-6">
              <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#24332D] font-bold text-[#F6F5F0]">
                1
              </div>
              <div className="flex-1 border border-[#E4E1D8] bg-white p-4 transition-all duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#2d3d36]">
                <div className="mb-2 flex items-center">
                  <Copy className="mr-2 h-5 w-5 text-[#A8CDB7]" />
                  <h3 className="font-serif text-lg">{t("steps.copy.title")}</h3>
                </div>
                <p className="text-[#4a564f] dark:text-[#CFC9BE] text-sm">
                  {t("steps.copy.descriptionMobile")}
                </p>
              </div>
            </div>

            <div className="relative flex items-start space-x-6">
              <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#24332D] font-bold text-[#F6F5F0]">
                2
              </div>
              <div className="flex-1 border border-[#E4E1D8] bg-white p-4 transition-all duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#2d3d36]">
                <div className="mb-2 flex items-center">
                  <Clipboard className="mr-2 h-5 w-5 text-[#A8CDB7]" />
                  <h3 className="font-serif text-lg">
                    {t("steps.paste.title")}
                  </h3>
                </div>
                <p className="text-[#4a564f] dark:text-[#CFC9BE] text-sm">
                  {t("steps.paste.descriptionMobile")}
                </p>
              </div>
            </div>

            <div className="relative flex items-start space-x-6">
              <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#24332D] font-bold text-[#F6F5F0]">
                3
              </div>
              <div className="flex-1 border border-[#E4E1D8] bg-white p-4 transition-all duration-200 hover:-translate-y-1 dark:border-white/10 dark:bg-[#2d3d36]">
                <div className="mb-2 flex items-center">
                  <Download className="mr-2 h-5 w-5 text-[#A8CDB7]" />
                  <h3 className="font-serif text-lg">
                    {t("steps.download.title")}
                  </h3>
                </div>
                <p className="text-[#4a564f] dark:text-[#CFC9BE] text-sm">
                  {t("steps.download.descriptionMobile")}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Button
              className="rounded-none bg-[#24332D] px-8 py-6 text-sm font-extrabold tracking-[0.08em] text-[#F6F5F0] uppercase hover:bg-[#314039]"
              asChild
            >
              <a href={homeLinks.hero}>{t("ctaButton")}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
