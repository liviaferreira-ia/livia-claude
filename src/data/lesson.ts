// Conteúdo estruturado de uma lição (estilo: Introdução → Vocabulário →
// Listening → Expressões → Tarefa final), usado na tela de visão geral da lição.

export type Vocab = { en: string; pt: string };
export type Expression = { en: string; pt: string };

export type Section = {
  id: string;
  eyebrow: string;
  title: string;
  href: string;
};

export const LESSON = {
  unit: "Unidade 3 · No hotel",
  title: "Reservas e check-in",
  intro:
    "Nesta lição você vai aprender a reservar um quarto e fazer o check-in em inglês. Vamos ver o vocabulário do hotel, ouvir uma conversa real, treinar as expressões mais úteis e, no fim, praticar tudo junto. Leva uns 15 minutos — sem pressa!",
  vocab: [
    { en: "reservation", pt: "reserva" },
    { en: "check-in", pt: "registro de entrada" },
    { en: "front desk", pt: "recepção" },
    { en: "room", pt: "quarto" },
    { en: "key card", pt: "cartão-chave" },
    { en: "breakfast", pt: "café da manhã" },
    { en: "luggage", pt: "bagagem" },
    { en: "guest", pt: "hóspede" },
  ] as Vocab[],
  expressions: [
    { en: "I have a reservation under Souza.", pt: "Tenho uma reserva no nome Souza." },
    { en: "Could I check in, please?", pt: "Eu poderia fazer o check-in, por favor?" },
    { en: "What time is breakfast?", pt: "Que horas é o café da manhã?" },
    { en: "Is breakfast included?", pt: "O café da manhã está incluído?" },
    { en: "Could you help me with my luggage?", pt: "Você poderia me ajudar com a bagagem?" },
  ] as Expression[],
  sections: [
    { id: "intro", eyebrow: "Introdução", title: "Comece por aqui", href: "/aluno/licao/intro" },
    { id: "vocabulario", eyebrow: "Vocabulário", title: "Palavras do hotel", href: "/aluno/licao/vocabulario" },
    { id: "listening", eyebrow: "Listening", title: "Ouvir uma conversa", href: "/aluno/licao/listening" },
    { id: "expressoes", eyebrow: "Expressões", title: "Fazendo o check-in", href: "/aluno/licao/expressoes" },
    { id: "exercicios", eyebrow: "Tarefa final", title: "Pratique tudo", href: "/aluno/licao/exercicios" },
  ] as Section[],
};
