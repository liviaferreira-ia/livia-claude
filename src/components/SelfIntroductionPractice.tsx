"use client";

import { useState } from "react";
import { PhrasePracticeButton } from "@/components/PhrasePracticeButton";
import { SpeakButton } from "@/components/SpeakButton";
import { useProfile } from "@/lib/profile";

export function SelfIntroductionPractice() {
  const { profile } = useProfile();
  const [customName, setCustomName] = useState("");
  const [country, setCountry] = useState("Brazil");
  const name = customName || profile.name.split(" ")[0] || "Alex";
  const phrase = `Hello! My name is ${name}. I'm from ${country}. Nice to meet you!`;

  return <div className="card self-introduction-card">
    <div className="eyebrow">Agora é a sua vez</div>
    <h3>Monte e fale sua apresentação</h3>
    <p className="muted">Confira seus dados, ouça o exemplo e depois repita em voz alta.</p>
    <div className="self-introduction-fields"><label>Meu nome<input value={name} onChange={(event) => setCustomName(event.target.value)} /></label><label>Meu país<input value={country} onChange={(event) => setCountry(event.target.value)} /></label></div>
    <div className="self-introduction-phrase">{phrase}</div>
    <div className="self-introduction-actions"><SpeakButton text={phrase} label="Ouvir minha apresentação" /><PhrasePracticeButton text={phrase} /></div>
  </div>;
}

