import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Central School — Inglês com IA",
  description:
    "Plataforma de inglês da Central School: aprenda a falar inglês com prática guiada por IA e acompanhamento de professores.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
