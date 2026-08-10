import Link from "next/link";
import { SpeakButton } from "@/components/SpeakButton";
import { ConcluirEtapa } from "@/components/ConcluirEtapa";

const DIALOGUE = [
  { who: "Recepção", en: "Good evening! Welcome to Central Hotel.", pt: "Boa noite! Bem-vindo ao Central Hotel." },
  { who: "Hóspede", en: "Hello. I have a reservation under Souza.", pt: "Olá. Tenho uma reserva no nome Souza." },
  {
    who: "Recepção",
    en: "Let me check... Yes, for two nights. Could I have your ID, please?",
    pt: "Deixe-me verificar... Sim, para duas noites. Pode me dar seu documento, por favor?",
  },
  { who: "Hóspede", en: "Here you are. What time is breakfast?", pt: "Aqui está. Que horas é o café da manhã?" },
  {
    who: "Recepção",
    en: "Breakfast is from 7 to 10 am. Here is your key card.",
    pt: "O café da manhã é das 7 às 10h. Aqui está seu cartão-chave.",
  },
];

const fullText = DIALOGUE.map((l) => l.en).join(" ");

export default function ListeningPage() {
  return (
    <div className="view" style={{ maxWidth: 680 }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>
        Listening
      </div>
      <h2 style={{ fontSize: 24, margin: "6px 0 4px" }}>Ouvir uma conversa</h2>
      <p className="muted" style={{ margin: "0 0 14px" }}>
        Um check-in no hotel. Ouça cada fala e tente entender antes de ler a tradução.
      </p>
      <div style={{ marginBottom: 14 }}>
        <SpeakButton text={fullText} label="▶ Ouvir a conversa toda" />
      </div>
      <div className="card" style={{ padding: "6px 20px" }}>
        {DIALOGUE.map((line, i) => (
          <div className="vrow" key={i}>
            <span className="vmain">
              <span className="ven" style={{ display: "block", fontSize: 15.5 }}>
                <span style={{ color: "var(--gold)" }}>{line.who}:</span> {line.en}
              </span>
              <span className="vpt" style={{ display: "block" }}>{line.pt}</span>
            </span>
            <SpeakButton text={line.en} label="Ouvir" />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <ConcluirEtapa id="listening" />
        <Link href="/aluno/licao" className="btn ghost">
          Voltar
        </Link>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
        A voz usa o recurso gratuito do navegador. Futuramente entra áudio/vídeo gravado.
      </p>
    </div>
  );
}
