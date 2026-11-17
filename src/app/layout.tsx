import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeInit } from "@/components/ThemeToggle";
import { MarketingTags } from "@/components/MarketingTags";
import { DESIGN_V2_PARA_TODOS } from "@/lib/design";

// Fontes do design v2, servidas pelo próprio site (sem requisição ao Google no navegador).
// Enquanto o visual novo é só da equipe, não pré-carrega para não pesar a página dos alunos.
// Ao liberar para todos (DESIGN_V2_PARA_TODOS = true), trocar preload para true. O Next exige valor literal aqui.
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap", preload: true });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", preload: true });

export const metadata: Metadata = {
  title: "Central School — Inglês para usar todos os dias",
  description:
    "Pratique inglês do A1 ao C2 com trilhas, conversas com IA, situações reais, jogos e acompanhamento de professores. Experimente a plataforma por 7 dias grátis, sem cartão.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased ${dmSans.variable} ${playfair.variable}`}
      data-design={DESIGN_V2_PARA_TODOS ? "v2" : undefined}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeInit />
        <MarketingTags />
        {children}
      </body>
    </html>
  );
}
