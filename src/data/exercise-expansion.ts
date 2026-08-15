import type { LevelBank } from "@/data/exercises";
import type { CefrLevel } from "@/data/placement";

type Seed = {
  id: string;
  sentence: string;
  pt: string;
  prompt: string;
  correct: string;
  distractors: [string, string, string];
  hint: string;
  explain: string;
  accepted?: string[];
};

const A1: Seed[] = [
  { id: "daily-breakfast", sentence: "I eat breakfast at seven", pt: "Eu tomo café da manhã às sete.", prompt: "I ___ breakfast at seven.", correct: "eat", distractors: ["eats", "eating", "ate"], hint: "present simple com I", explain: "Com I, usamos a forma base: eat." },
  { id: "sister-teacher", sentence: "My sister is a teacher", pt: "Minha irmã é professora.", prompt: "My sister ___ a teacher.", correct: "is", distractors: ["are", "am", "be"], hint: "verbo to be no singular", explain: "My sister equivale a she: is." },
  { id: "books-bag", sentence: "There are three books in my bag", pt: "Há três livros na minha bolsa.", prompt: "There ___ three books in my bag.", correct: "are", distractors: ["is", "am", "be"], hint: "there + plural", explain: "Three books está no plural: there are." },
  { id: "likes-music", sentence: "He likes Brazilian music", pt: "Ele gosta de música brasileira.", prompt: "He ___ Brazilian music.", correct: "likes", distractors: ["like", "liking", "liked"], hint: "3ª pessoa no presente", explain: "No present simple, he pede likes." },
  { id: "can-cook", sentence: "We can cook dinner tonight", pt: "Nós podemos preparar o jantar hoje à noite.", prompt: "We can ___ dinner tonight.", correct: "cook", distractors: ["cooks", "cooking", "cooked"], hint: "verbo depois de can", explain: "Depois de can, usamos a forma base: cook." },
  { id: "not-tired", sentence: "They are not tired today", pt: "Eles não estão cansados hoje.", prompt: "They ___ not tired today.", correct: "are", distractors: ["is", "am", "be"], hint: "to be com they", explain: "They combina com are." },
  { id: "where-live", sentence: "Where do you live", pt: "Onde você mora?", prompt: "Where ___ you live?", correct: "do", distractors: ["does", "are", "is"], hint: "pergunta no present simple", explain: "Com you, a pergunta usa do." },
  { id: "some-water", sentence: "I would like some water", pt: "Eu gostaria de um pouco de água.", prompt: "I would like ___ water.", correct: "some", distractors: ["many", "a", "an"], hint: "quantidade incontável", explain: "Water é incontável; em pedidos, some é natural." },
  { id: "bus-stop", sentence: "The bus stop is next to the bank", pt: "O ponto de ônibus fica ao lado do banco.", prompt: "The bus stop is ___ to the bank.", correct: "next", distractors: ["near of", "between of", "on"], hint: "expressão de lugar", explain: "Ao lado de é next to." },
];

const A2: Seed[] = [
  { id: "already-finished", sentence: "I have already finished my homework", pt: "Eu já terminei minha lição de casa.", prompt: "I have ___ finished my homework.", correct: "already", distractors: ["yet", "ever", "ago"], hint: "ação concluída antes do esperado", explain: "Already aparece normalmente em frases afirmativas no present perfect." },
  { id: "used-bus", sentence: "She took the bus to work yesterday", pt: "Ela pegou o ônibus para o trabalho ontem.", prompt: "She ___ the bus to work yesterday.", correct: "took", distractors: ["take", "takes", "taken"], hint: "passado de take", explain: "O passado irregular de take é took." },
  { id: "more-comfortable", sentence: "This chair is more comfortable than that one", pt: "Esta cadeira é mais confortável que aquela.", prompt: "This chair is ___ comfortable than that one.", correct: "more", distractors: ["most", "much", "many"], hint: "comparativo de adjetivo longo", explain: "Adjetivos longos formam o comparativo com more." },
  { id: "rain-cancel", sentence: "If it rains we will stay home", pt: "Se chover, nós ficaremos em casa.", prompt: "If it ___, we will stay home.", correct: "rains", distractors: ["will rain", "rained", "rain"], hint: "primeira condicional", explain: "Na oração com if usamos o presente simples: rains." },
  { id: "ever-london", sentence: "Have you ever visited London", pt: "Você já visitou Londres?", prompt: "Have you ___ visited London?", correct: "ever", distractors: ["never", "ago", "last"], hint: "experiência de vida", explain: "Ever é usado em perguntas sobre experiências." },
  { id: "too-heavy", sentence: "This suitcase is too heavy to carry", pt: "Esta mala é pesada demais para carregar.", prompt: "This suitcase is ___ heavy to carry.", correct: "too", distractors: ["enough", "many", "so much"], hint: "excesso que impede algo", explain: "Too + adjetivo indica excesso." },
  { id: "waiting-hour", sentence: "We waited for an hour yesterday", pt: "Nós esperamos por uma hora ontem.", prompt: "We waited ___ an hour yesterday.", correct: "for", distractors: ["since", "during", "from"], hint: "duração", explain: "For acompanha um período de tempo." },
  { id: "should-doctor", sentence: "You should see a doctor", pt: "Você deveria consultar um médico.", prompt: "You ___ see a doctor.", correct: "should", distractors: ["must to", "should to", "can to"], hint: "conselho", explain: "Should expressa conselho e vem antes do verbo base." },
  { id: "was-cooking", sentence: "I was cooking when you called", pt: "Eu estava cozinhando quando você ligou.", prompt: "I ___ cooking when you called.", correct: "was", distractors: ["were", "am", "have"], hint: "ação em andamento no passado", explain: "Com I no past continuous usamos was." },
  { id: "enough-money", sentence: "We do not have enough money for the trip", pt: "Nós não temos dinheiro suficiente para a viagem.", prompt: "We do not have ___ money for the trip.", correct: "enough", distractors: ["too", "many", "few"], hint: "quantidade suficiente", explain: "Enough antes do substantivo significa suficiente." },
];

const B1: Seed[] = [
  { id: "since-graduated", sentence: "I have worked here since I graduated", pt: "Trabalho aqui desde que me formei.", prompt: "I have worked here ___ I graduated.", correct: "since", distractors: ["for", "during", "ago"], hint: "ponto inicial", explain: "Since introduz o momento em que a situação começou." },
  { id: "would-travel", sentence: "If I had more time I would travel more", pt: "Se eu tivesse mais tempo, viajaria mais.", prompt: "If I ___ more time, I would travel more.", correct: "had", distractors: ["have", "will have", "would have"], hint: "segunda condicional", explain: "Na segunda condicional usamos passado após if." },
  { id: "book-written", sentence: "The book was written by a local journalist", pt: "O livro foi escrito por um jornalista local.", prompt: "The book was written ___ a local journalist.", correct: "by", distractors: ["from", "of", "with"], hint: "agente da voz passiva", explain: "O agente da voz passiva é introduzido por by." },
  { id: "woman-who", sentence: "The woman who called you is my manager", pt: "A mulher que ligou para você é minha gerente.", prompt: "The woman ___ called you is my manager.", correct: "who", distractors: ["which", "where", "whose"], hint: "pronome relativo para pessoa", explain: "Who retoma uma pessoa." },
  { id: "used-wake", sentence: "I used to wake up late on weekends", pt: "Eu costumava acordar tarde nos fins de semana.", prompt: "I ___ to wake up late on weekends.", correct: "used", distractors: ["use", "using", "was"], hint: "hábito passado", explain: "Used to descreve um hábito que existia no passado." },
  { id: "avoid-driving", sentence: "She avoids driving during rush hour", pt: "Ela evita dirigir no horário de pico.", prompt: "She avoids ___ during rush hour.", correct: "driving", distractors: ["to drive", "drive", "drove"], hint: "verbo depois de avoid", explain: "Avoid é seguido de gerúndio." },
  { id: "asked-whether", sentence: "He asked whether I needed any help", pt: "Ele perguntou se eu precisava de ajuda.", prompt: "He asked ___ I needed any help.", correct: "whether", distractors: ["what", "that", "which"], hint: "pergunta indireta sim/não", explain: "Whether pode introduzir perguntas indiretas de sim ou não." },
  { id: "not-enough", sentence: "The room was not big enough for everyone", pt: "A sala não era grande o suficiente para todos.", prompt: "The room was not big ___ for everyone.", correct: "enough", distractors: ["too", "very", "much"], hint: "adjetivo + suficiente", explain: "Enough vem depois do adjetivo: big enough." },
  { id: "unless-leave", sentence: "We will miss the train unless we leave now", pt: "Perderemos o trem se não sairmos agora.", prompt: "We will miss the train ___ we leave now.", correct: "unless", distractors: ["if", "because", "although"], hint: "se não", explain: "Unless significa if not." },
  { id: "despite-rain", sentence: "Despite the rain they continued playing", pt: "Apesar da chuva, eles continuaram jogando.", prompt: "___ the rain, they continued playing.", correct: "Despite", distractors: ["Although", "Because", "Unless"], hint: "contraste antes de substantivo", explain: "Despite é seguido diretamente por substantivo." },
];

const B2: Seed[] = [
  { id: "wish-listened", sentence: "I wish I had listened to your advice", pt: "Eu queria ter ouvido seu conselho.", prompt: "I wish I ___ listened to your advice.", correct: "had", distractors: ["have", "would", "was"], hint: "arrependimento passado", explain: "Wish sobre o passado usa past perfect." },
  { id: "hardly-arrived", sentence: "Hardly had we arrived when the meeting started", pt: "Mal chegamos e a reunião começou.", prompt: "Hardly ___ we arrived when the meeting started.", correct: "had", distractors: ["have", "did", "were"], hint: "inversão após hardly", explain: "Hardly no início exige inversão com had." },
  { id: "expected-finish", sentence: "The project is expected to be completed next month", pt: "Espera-se que o projeto seja concluído no próximo mês.", prompt: "The project is expected ___ completed next month.", correct: "to be", distractors: ["being", "to have", "for being"], hint: "estrutura passiva de expectativa", explain: "A estrutura passiva é be expected to be + particípio." },
  { id: "provided-submit", sentence: "You can apply provided that you submit all documents", pt: "Você pode se candidatar desde que envie todos os documentos.", prompt: "You can apply ___ that you submit all documents.", correct: "provided", distractors: ["despite", "unless", "whereas"], hint: "desde que", explain: "Provided that introduz uma condição." },
  { id: "accustomed-working", sentence: "She is accustomed to working under pressure", pt: "Ela está acostumada a trabalhar sob pressão.", prompt: "She is accustomed to ___ under pressure.", correct: "working", distractors: ["work", "worked", "have worked"], hint: "to como preposição", explain: "Em accustomed to, to é preposição e pede gerúndio." },
  { id: "need-not", sentence: "You need not bring any equipment", pt: "Você não precisa trazer nenhum equipamento.", prompt: "You ___ not bring any equipment.", correct: "need", distractors: ["must", "should", "ought"], hint: "ausência de necessidade", explain: "Need not significa que algo não é necessário." },
  { id: "which-rejected", sentence: "They rejected the offer which surprised everyone", pt: "Eles recusaram a oferta, o que surpreendeu todos.", prompt: "They rejected the offer, ___ surprised everyone.", correct: "which", distractors: ["who", "what", "where"], hint: "comentário sobre a oração anterior", explain: "Which pode retomar toda a ideia anterior." },
  { id: "might-forgotten", sentence: "He might have forgotten about the appointment", pt: "Talvez ele tenha esquecido o compromisso.", prompt: "He might ___ forgotten about the appointment.", correct: "have", distractors: ["has", "had", "to have"], hint: "modal sobre o passado", explain: "Modal + have + particípio expressa possibilidade passada." },
  { id: "far-more", sentence: "The new system is far more efficient than the old one", pt: "O novo sistema é muito mais eficiente que o antigo.", prompt: "The new system is ___ more efficient than the old one.", correct: "far", distractors: ["very", "many", "enough"], hint: "intensificador de comparativo", explain: "Far pode intensificar um comparativo." },
  { id: "recommended-taking", sentence: "The doctor recommended taking a few days off", pt: "O médico recomendou tirar alguns dias de folga.", prompt: "The doctor recommended ___ a few days off.", correct: "taking", distractors: ["to take", "take", "took"], hint: "verbo após recommend", explain: "Recommend pode ser seguido de gerúndio." },
];

const C1: Seed[] = [
  { id: "little-realize", sentence: "Little did she realize how much the decision would cost", pt: "Mal sabia ela quanto a decisão custaria.", prompt: "Little ___ she realize how much the decision would cost.", correct: "did", distractors: ["had", "was", "has"], hint: "inversão após expressão negativa", explain: "Little no início exige inversão com did." },
  { id: "were-it", sentence: "Were it not for your support the project would have failed", pt: "Se não fosse seu apoio, o projeto teria fracassado.", prompt: "___ it not for your support, the project would have failed.", correct: "Were", distractors: ["Was", "Had", "If"], hint: "condicional formal invertida", explain: "Were it not for é uma condicional formal sem if." },
  { id: "no-account", sentence: "On no account should these files be shared", pt: "Em hipótese alguma estes arquivos devem ser compartilhados.", prompt: "On no account ___ these files be shared.", correct: "should", distractors: ["these should", "they", "do"], hint: "inversão formal", explain: "Uma expressão negativa inicial exige inversão com should." },
  { id: "notwithstanding", sentence: "Notwithstanding the criticism the policy remained in force", pt: "Apesar das críticas, a política continuou em vigor.", prompt: "___ the criticism, the policy remained in force.", correct: "Notwithstanding", distractors: ["Whereas", "Provided", "Unless"], hint: "apesar de", explain: "Notwithstanding significa apesar de e pode vir antes de substantivo." },
  { id: "be-that", sentence: "Be that as it may we still need a practical solution", pt: "Seja como for, ainda precisamos de uma solução prática.", prompt: "___ that as it may, we still need a practical solution.", correct: "Be", distractors: ["Is", "Being", "Was"], hint: "expressão concessiva fixa", explain: "Be that as it may significa seja como for." },
  { id: "ought-known", sentence: "They ought to have known the risks involved", pt: "Eles deveriam ter conhecimento dos riscos envolvidos.", prompt: "They ought to ___ known the risks involved.", correct: "have", distractors: ["had", "be", "having"], hint: "crítica sobre o passado", explain: "Ought to have + particípio fala de uma obrigação passada não cumprida." },
  { id: "under-no", sentence: "Under no circumstances are visitors allowed beyond this point", pt: "Em nenhuma circunstância visitantes podem passar deste ponto.", prompt: "Under no circumstances ___ visitors allowed beyond this point.", correct: "are", distractors: ["visitors are", "do", "have"], hint: "inversão depois de expressão negativa", explain: "A expressão negativa inicial exige inversão: are visitors." },
  { id: "much-as", sentence: "Much as I respect her I disagree with this decision", pt: "Por mais que eu a respeite, discordo desta decisão.", prompt: "___ as I respect her, I disagree with this decision.", correct: "Much", distractors: ["Many", "More", "Most"], hint: "concessão formal", explain: "Much as introduz uma concessão formal." },
  { id: "lest-forget", sentence: "Write it down lest you forget the details", pt: "Anote para não esquecer os detalhes.", prompt: "Write it down ___ you forget the details.", correct: "lest", distractors: ["unless", "despite", "whereas"], hint: "para evitar que", explain: "Lest significa para que não ou para evitar que." },
  { id: "seems-overlooked", sentence: "The report seems to have overlooked several key factors", pt: "O relatório parece ter ignorado vários fatores importantes.", prompt: "The report seems to ___ overlooked several key factors.", correct: "have", distractors: ["has", "had", "having"], hint: "infinitivo perfeito", explain: "Seems to have + particípio indica uma ação anterior." },
];

const C2: Seed[] = [
  { id: "scarcely-concluded", sentence: "Scarcely had the speech concluded when the objections began", pt: "Mal o discurso terminou e começaram as objeções.", prompt: "Scarcely ___ the speech concluded when the objections began.", correct: "had", distractors: ["has", "did", "was"], hint: "inversão com scarcely", explain: "Scarcely no início exige inversão com had." },
  { id: "suffice-say", sentence: "Suffice it to say that the negotiations were difficult", pt: "Basta dizer que as negociações foram difíceis.", prompt: "___ it to say that the negotiations were difficult.", correct: "Suffice", distractors: ["Sufficient", "Suffices", "Sufficing"], hint: "expressão formal fixa", explain: "Suffice it to say é uma expressão formal que significa basta dizer." },
  { id: "come-what", sentence: "Come what may we shall honor our commitment", pt: "Aconteça o que acontecer, honraremos nosso compromisso.", prompt: "Come what ___, we shall honor our commitment.", correct: "may", distractors: ["might", "will", "would"], hint: "expressão concessiva fixa", explain: "Come what may significa aconteça o que acontecer." },
  { id: "had-heeded", sentence: "Had the warning been heeded the crisis might have been avoided", pt: "Se o alerta tivesse sido atendido, a crise talvez tivesse sido evitada.", prompt: "___ the warning been heeded, the crisis might have been avoided.", correct: "Had", distractors: ["Have", "Was", "Would"], hint: "terceira condicional invertida", explain: "Had + sujeito + particípio substitui if na condicional formal." },
  { id: "far-be-it", sentence: "Far be it from me to question her integrity", pt: "Longe de mim questionar a integridade dela.", prompt: "Far ___ it from me to question her integrity.", correct: "be", distractors: ["is", "being", "was"], hint: "expressão formal fixa", explain: "Far be it from me é uma expressão fixa." },
  { id: "whatsoever", sentence: "There is no evidence whatsoever to support the allegation", pt: "Não há absolutamente nenhuma evidência que sustente a alegação.", prompt: "There is no evidence ___ to support the allegation.", correct: "whatsoever", distractors: ["whatever", "however", "whereas"], hint: "ênfase depois de no", explain: "Whatsoever reforça a ausência total de algo." },
  { id: "would-rather", sentence: "I would rather the matter remained confidential", pt: "Eu preferiria que o assunto permanecesse confidencial.", prompt: "I would rather the matter ___ confidential.", correct: "remained", distractors: ["remains", "will remain", "has remained"], hint: "preferência sobre outra pessoa ou situação", explain: "Would rather + sujeito usa passado para uma preferência presente." },
  { id: "so-compelling", sentence: "So compelling was the evidence that the verdict was unanimous", pt: "As provas eram tão convincentes que o veredito foi unânime.", prompt: "So compelling ___ the evidence that the verdict was unanimous.", correct: "was", distractors: ["were", "did", "had"], hint: "inversão enfática", explain: "So + adjetivo no início provoca inversão com o verbo be." },
  { id: "not-so-much", sentence: "It was not so much a refusal as a request for more time", pt: "Não foi tanto uma recusa, mas um pedido de mais tempo.", prompt: "It was not so much a refusal ___ a request for more time.", correct: "as", distractors: ["than", "but", "like"], hint: "estrutura de contraste", explain: "A estrutura correta é not so much X as Y." },
  { id: "inasmuch-as", sentence: "Inasmuch as the data are incomplete any conclusion remains tentative", pt: "Como os dados estão incompletos, qualquer conclusão permanece provisória.", prompt: "___ as the data are incomplete, any conclusion remains tentative.", correct: "Inasmuch", distractors: ["Insofar", "Although", "Provided"], hint: "na medida em que", explain: "Inasmuch as introduz uma justificativa formal." },
];

function normalizeSentence(sentence: string): string {
  return sentence.toLowerCase().replace(/[.,!?;]/g, "").replace(/’/g, "'").trim();
}

function shuffledWords(sentence: string, index: number): string[] {
  const words = normalizeSentence(sentence).split(/\s+/);
  const pivot = (index % Math.max(1, words.length - 1)) + 1;
  return [...words.slice(pivot), ...words.slice(0, pivot)].reverse();
}

function makeBank(level: CefrLevel, seeds: Seed[], limits: Record<keyof LevelBank, number>): LevelBank {
  const prefix = level.toLowerCase();
  return {
    mc: seeds.slice(0, limits.mc).map((seed, index) => {
      const raw = [seed.correct, ...seed.distractors];
      const shift = index % raw.length;
      const options = [...raw.slice(shift), ...raw.slice(0, shift)];
      return { id: `x-${prefix}-${seed.id}-mc`, prompt: seed.prompt, options, answer: options.indexOf(seed.correct), explain: seed.explain };
    }),
    fill: seeds.slice(0, limits.fill).map((seed) => ({
      id: `x-${prefix}-${seed.id}-fill`, prompt: seed.prompt, hint: seed.hint,
      answers: seed.accepted ?? [seed.correct], explain: seed.explain,
    })),
    translate: seeds.slice(0, limits.translate).map((seed) => ({
      id: `x-${prefix}-${seed.id}-translate`, pt: seed.pt,
      answers: [normalizeSentence(seed.sentence)], explain: seed.sentence,
    })),
    order: seeds.slice(0, limits.order).map((seed, index) => ({
      id: `x-${prefix}-${seed.id}-order`, words: shuffledWords(seed.sentence, index),
      answer: normalizeSentence(seed.sentence), pt: seed.pt,
    })),
  };
}

export const EXPANSION_EXERCISES: Record<CefrLevel, LevelBank> = {
  A1: makeBank("A1", A1, { mc: 9, fill: 9, translate: 9, order: 9 }),
  A2: makeBank("A2", A2, { mc: 10, fill: 10, translate: 10, order: 9 }),
  B1: makeBank("B1", B1, { mc: 10, fill: 10, translate: 10, order: 9 }),
  B2: makeBank("B2", B2, { mc: 10, fill: 10, translate: 10, order: 9 }),
  C1: makeBank("C1", C1, { mc: 10, fill: 10, translate: 9, order: 9 }),
  C2: makeBank("C2", C2, { mc: 10, fill: 10, translate: 9, order: 9 }),
};
