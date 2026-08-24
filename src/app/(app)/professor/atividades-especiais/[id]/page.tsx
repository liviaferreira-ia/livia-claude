"use client";

import { useParams } from "next/navigation";
import { SpecialActivityForm } from "@/components/SpecialActivityForm";

export default function EditarAtividadeEspecialPage() {
  const { id } = useParams<{ id: string }>();
  return <SpecialActivityForm activityId={id} />;
}
