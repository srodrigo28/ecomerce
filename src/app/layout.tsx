import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeSwitcher } from "@/components/theme-switcher";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hierarquia | Marketplace Multiloja",
  description:
    "Frontend do projeto Hierarquia focado em vitrine, captacao de lojistas e painel comercial antes da integracao da API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        {children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
