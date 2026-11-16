"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function PendingReviewsLink({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <Link href="/professor/aulas" prefetch={false} className={className} style={style} onNavigate={(event) => {
    // Fetch the saved queue again instead of restoring a previously visited list.
    event.preventDefault();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- A full request refreshes the queue after approval, including a previously cached visit.
    window.location.assign("/professor/aulas");
  }}>{children}</Link>;
}
