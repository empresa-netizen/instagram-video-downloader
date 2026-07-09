"use client";

import React from "react";

import { useTranslations } from "next-intl";
import { useIsMobile } from "@/hooks/use-is-mobile";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { LogoImage, LogoText } from "@/components/logo";
import { LocaleDropdown } from "@/features/i18n/locale-dropdown";
import { ThemeToggleButton } from "@/features/theme/theme-toggle-button";

import { Menu } from "lucide-react";

import { homeLinks } from "@/lib/constants";

export function Header() {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const t = useTranslations("layouts.home.header");

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    if (!isMobile && open) {
      setOpen(false);
    }
  }, [isMobile, open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E4E1D8] bg-[#F6F5F0]/90 backdrop-blur supports-[backdrop-filter]:bg-[#F6F5F0]/80 dark:border-white/10 dark:bg-[#24332D]/90">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div
          role="button"
          onClick={scrollUp}
          className="flex cursor-pointer items-center gap-3"
        >
          <LogoImage className="h-7 w-9 text-[#24332D] dark:text-[#F6F5F0]" />
          <div className="flex flex-col leading-none">
            <LogoText className="text-[#24332D] dark:text-[#F6F5F0]" />
            <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.28em] text-[#6B746D] uppercase sm:block">
              Saúde · Estética · Performance
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <a
            href={homeLinks.features}
            className="text-sm font-semibold transition-colors hover:text-[#6B746D]"
          >
            {t("links.features")}
          </a>
          <a
            href={homeLinks.howItWorks}
            className="text-sm font-semibold transition-colors hover:text-[#6B746D]"
          >
            {t("links.howItWorks")}
          </a>
          <a
            href={homeLinks.frequentlyAsked}
            className="text-sm font-semibold transition-colors hover:text-[#6B746D]"
          >
            {t("links.frequentlyAsked")}
          </a>

          <div className="flex items-center gap-2 border-l border-[#E4E1D8] pl-2 dark:border-white/10">
            <LocaleDropdown />
            <ThemeToggleButton />
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="ml-auto flex items-center md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[80%] border-[#E4E1D8] bg-[#F6F5F0] pr-0 sm:w-[350px] dark:border-white/10 dark:bg-[#24332D]"
            >
              <SheetHeader className="border-b border-[#E4E1D8] dark:border-white/10">
                <SheetTitle>
                  <div className="flex items-center gap-3">
                    <LogoImage className="h-7 w-9 text-[#24332D] dark:text-[#F6F5F0]" />
                    <LogoText />
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <nav className="flex flex-col gap-4 px-4">
                  <a
                    href={homeLinks.features}
                    className="px-2 py-2 text-lg font-semibold transition-colors hover:text-[#6B746D]"
                    onClick={() => setOpen(false)}
                  >
                    {t("links.features")}
                  </a>

                  <a
                    href={homeLinks.howItWorks}
                    className="px-2 py-2 text-lg font-semibold transition-colors hover:text-[#6B746D]"
                    onClick={() => setOpen(false)}
                  >
                    {t("links.howItWorks")}
                  </a>
                  <a
                    href={homeLinks.frequentlyAsked}
                    className="px-2 py-2 text-lg font-semibold transition-colors hover:text-[#6B746D]"
                    onClick={() => setOpen(false)}
                  >
                    {t("links.frequentlyAsked")}
                  </a>
                </nav>
              </div>
              <div className="mt-auto border-t border-[#E4E1D8] px-4 py-2 dark:border-white/10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t("themeLabel")}
                    </span>
                    <ThemeToggleButton variant="outline" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t("localeLabel")}
                    </span>
                    <LocaleDropdown variant="outline" />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
