import { Metadata } from "next";

export const siteConfig = {
  name: "MGTEAM Downloader",
  domain: "downloader.mgteamoficial.site",
  shortName: "MGTEAM",
  creator: "MGTEAM",
  description:
    "Baixe posts, reels e carrosséis do Instagram com a identidade MGTEAM.",
  ogDescription:
    "Ferramenta MGTEAM para baixar posts, reels e carrosséis do Instagram.",
  url: "https://downloader.mgteamoficial.site",
};

export const siteMetadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  creator: siteConfig.creator,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: siteConfig.name,
    description: siteConfig.ogDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.ogDescription,
    creator: siteConfig.creator,
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/brand/LOGO_02_Simbolo_FINAL.png",
  },
  manifest: "/web.manifest.json",
};
