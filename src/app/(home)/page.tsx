import HomePage from "./page-content";

import { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { cookieName, isSessionValid } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.home");

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ProtectedHomePage() {
  const cookieStore = await cookies();
  if (!isSessionValid(cookieStore.get(cookieName)?.value)) redirect("/login");
  return <HomePage />;
}
