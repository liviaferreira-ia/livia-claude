import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Central School — Inglês como estilo de vida",
  description:
    "Aprenda inglês com prática digital guiada, situações reais e acompanhamento de professores.",
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
