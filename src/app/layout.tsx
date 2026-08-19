import type { Metadata } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/ThemeToggle";
import { MarketingTags } from "@/components/MarketingTags";

export const metadata: Metadata = {
  title: "Central School — Inglês para usar todos os dias",
  description:
    "Pratique inglês do A1 ao C2 com trilhas, conversas com IA, situações reais, jogos e acompanhamento de professores. Experimente a plataforma por 7 dias grátis, sem cartão.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeInit />
        <MarketingTags />
        {children}
      </body>
    </html>
  );
}
