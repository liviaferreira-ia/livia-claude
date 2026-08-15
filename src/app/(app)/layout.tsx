import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { TrialBanner } from "@/components/TrialBanner";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell><TrialBanner />{children}</AppShell>;
}
