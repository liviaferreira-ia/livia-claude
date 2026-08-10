// Banco de exercícios, organizado por nível CEFR (A1-C2). Cada nível tem seu
// próprio conjunto de múltipla escolha, completar lacuna, tradução e ordenar
// palavras. Nem todo nível tem conteúdo ainda — veja `resolveExerciseLevel`,
// que cai pro nível populado mais próximo enquanto o resto é construído.

import { nearestLevelWithContent, type CefrLevel } from "@/data/placement";

export type Kind = "mc" | "fill" | "translate" | "order";

export type MC = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
};

export type Fill = {
  id: string;
  prompt: string; // usa ___ para a lacuna
  hint: string;
  answers: string[];
  explain: string;
};

export type Translate = {
  id: string;
  pt: string;
  answers: string[]; // formas aceitas (normalizadas)
  explain: string;
};

export type Order = {
  id: string;
  words: string[]; // embaralhadas para exibir
  answer: string; // frase correta
  pt: string;
};

export type LevelBank = {
  mc: MC[];
  fill: Fill[];
  translate: Translate[];
  order: Order[];
};

// ================= A2 =================
// Temas: apresentações, rotina, hotel, restaurante, viagem, compras, direções.

const MC_A2: MC[] = [
  { id: "mc1", prompt: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking", "drank"], answer: 1, explain: "3ª pessoa (she) no present simple leva -s: drinks." },
  { id: "mc2", prompt: "___ you speak English?", options: ["Do", "Does", "Are", "Is"], answer: 0, explain: "Com 'you' usamos Do para perguntas." },
  { id: "mc3", prompt: "There ___ two beds in the room.", options: ["is", "are", "am", "be"], answer: 1, explain: "Plural (two beds) usa are." },
  { id: "mc4", prompt: "I ___ a reservation for tonight.", options: ["has", "have", "haves", "having"], answer: 1, explain: "Com 'I' usamos have." },
  { id: "mc5", prompt: "We ___ to the beach yesterday.", options: ["go", "goes", "went", "going"], answer: 2, explain: "Yesterday indica passado: went." },
  { id: "mc6", prompt: "He doesn't ___ meat.", options: ["eat", "eats", "ate", "eating"], answer: 0, explain: "Depois de doesn't, o verbo fica na forma base: eat." },
  { id: "mc7", prompt: "What time ___ the museum open?", options: ["do", "does", "is", "are"], answer: 1, explain: "Sujeito no singular (the museum) usa does." },
  { id: "mc8", prompt: "Breakfast is served ___ 7 to 10.", options: ["in", "at", "from", "since"], answer: 2, explain: "Intervalo: from ... to." },
  { id: "mc9", prompt: "Can I ___ the menu, please?", options: ["to see", "see", "seeing", "saw"], answer: 1, explain: "Depois de can, verbo na forma base: see." },
  { id: "mc10", prompt: "They are ___ for the bus.", options: ["wait", "waits", "waiting", "waited"], answer: 2, explain: "are + verbo-ing (present continuous): waiting." },
  { id: "mc11", prompt: "This is ___ apple.", options: ["a", "an", "the", "some"], answer: 1, explain: "Antes de som de vogal usamos an." },
  { id: "mc12", prompt: "My sister is ___ than me.", options: ["tall", "taller", "tallest", "more tall"], answer: 1, explain: "Comparativo de adjetivo curto: taller." },
  { id: "mc13", prompt: "How ___ is the ticket?", options: ["many", "much", "old", "long"], answer: 1, explain: "Para preço/incontável usamos much." },
  { id: "mc14", prompt: "I usually ___ up at 7 a.m.", options: ["get", "gets", "got", "getting"], answer: 0, explain: "Com 'I' no present simple: get." },
  { id: "mc15", prompt: "She lives ___ São Paulo.", options: ["on", "at", "in", "to"], answer: 2, explain: "Cidades usam in." },
  { id: "mc16", prompt: "Would you like ___ water?", options: ["some", "any", "a", "many"], answer: 0, explain: "Em oferecimentos usamos some." },
  { id: "mc17", prompt: "He ___ TV last night.", options: ["watch", "watches", "watched", "watching"], answer: 2, explain: "Passado regular: watch + ed = watched." },
  { id: "mc18", prompt: "There isn't ___ milk.", options: ["some", "any", "a", "many"], answer: 1, explain: "Em frases negativas usamos any." },
  { id: "mc19", prompt: "The keys are ___ the table.", options: ["in", "on", "at", "of"], answer: 1, explain: "Superfície: on the table." },
  { id: "mc20", prompt: "We ___ going to travel next week.", options: ["is", "am", "are", "be"], answer: 2, explain: "We + are (going to)." },
  { id: "mc21", prompt: "Excuse me, ___ is the station?", options: ["what", "where", "who", "when"], answer: 1, explain: "Para lugar usamos where." },
  { id: "mc22", prompt: "I'd like to ___ a table for two.", options: ["book", "books", "booked", "booking"], answer: 0, explain: "Depois de to, verbo na base: book." },
  { id: "mc23", prompt: "She can ___ very well.", options: ["swims", "swim", "swam", "swimming"], answer: 1, explain: "Depois de can, forma base: swim." },
  { id: "mc24", prompt: "This bag is ___ than that one.", options: ["cheap", "cheaper", "cheapest", "more cheap"], answer: 1, explain: "Comparativo: cheaper." },
  { id: "mc25", prompt: "___ the check, please?", options: ["Could I have", "Could I to have", "I could have", "Have I could"], answer: 0, explain: "Pedido educado: Could I have...?" },
  { id: "mc26", prompt: "He is interested ___ art.", options: ["on", "in", "at", "for"], answer: 1, explain: "Interested + in." },
  { id: "mc27", prompt: "We didn't ___ the film.", options: ["like", "liked", "likes", "liking"], answer: 0, explain: "Depois de didn't, forma base: like." },
  { id: "mc28", prompt: "There are ___ people at the airport.", options: ["much", "a lot of", "a little", "any"], answer: 1, explain: "Contável no plural: a lot of." },
  { id: "mc29", prompt: "What ___ you doing now?", options: ["is", "am", "are", "do"], answer: 2, explain: "Present continuous com you: are." },
  { id: "mc30", prompt: "I'm going to ___ my grandmother.", options: ["visit", "visits", "visited", "visiting"], answer: 0, explain: "going to + forma base: visit." },
  { id: "mc31", prompt: "The restaurant is ___ the hotel.", options: ["next", "next to", "near of", "beside of"], answer: 1, explain: "Ao lado de: next to." },
  { id: "mc32", prompt: "She has ___ homework today.", options: ["many", "a lot of", "a few", "some of"], answer: 1, explain: "Homework é incontável: a lot of." },
];

const FILL_A2: Fill[] = [
  { id: "f1", prompt: "I ___ (be) a student.", hint: "verbo to be, presente", answers: ["am"], explain: "I am." },
  { id: "f2", prompt: "She ___ (go) to school by bus.", hint: "3ª pessoa, present simple", answers: ["goes"], explain: "go → goes." },
  { id: "f3", prompt: "They ___ (not / like) fish.", hint: "negativa", answers: ["don't like", "do not like"], explain: "don't like." },
  { id: "f4", prompt: "___ he play football? (pergunta)", hint: "auxiliar", answers: ["does"], explain: "Does he play...?" },
  { id: "f5", prompt: "We ___ (watch) a movie yesterday.", hint: "passado", answers: ["watched"], explain: "watch → watched." },
  { id: "f6", prompt: "I ___ (have) a reservation.", hint: "com 'I'", answers: ["have"], explain: "I have." },
  { id: "f7", prompt: "What time ___ (be) breakfast?", hint: "singular", answers: ["is"], explain: "is." },
  { id: "f8", prompt: "She ___ (study) English every day.", hint: "3ª pessoa", answers: ["studies"], explain: "study → studies." },
  { id: "f9", prompt: "He ___ (not / eat) meat.", hint: "negativa, 3ª pessoa", answers: ["doesn't eat", "does not eat"], explain: "doesn't eat." },
  { id: "f10", prompt: "We ___ (go) to Rio last month.", hint: "passado irregular", answers: ["went"], explain: "go → went." },
  { id: "f11", prompt: "There ___ (be) two bags here.", hint: "plural", answers: ["are"], explain: "are." },
  { id: "f12", prompt: "I ___ (wake) up at 6 every day.", hint: "present simple", answers: ["wake"], explain: "wake up." },
  { id: "f13", prompt: "Anna ___ (arrive) at 8 a.m.", hint: "3ª pessoa", answers: ["arrives"], explain: "arrive → arrives." },
  { id: "f14", prompt: "___ you like coffee? (pergunta)", hint: "auxiliar com you", answers: ["do"], explain: "Do you like...?" },
  { id: "f15", prompt: "I ___ (buy) a ticket yesterday.", hint: "passado irregular", answers: ["bought"], explain: "buy → bought." },
  { id: "f16", prompt: "The keys are ___ the table.", hint: "preposição de lugar", answers: ["on"], explain: "on the table." },
  { id: "f17", prompt: "She ___ (can) swim very well.", hint: "modal", answers: ["can"], explain: "can swim." },
  { id: "f18", prompt: "We ___ (not / have) time now.", hint: "negativa", answers: ["don't have", "do not have"], explain: "don't have." },
  { id: "f19", prompt: "He ___ (do) his homework last night.", hint: "passado", answers: ["did"], explain: "do → did." },
  { id: "f20", prompt: "I live ___ Brazil.", hint: "país", answers: ["in"], explain: "in Brazil." },
  { id: "f21", prompt: "___ time do you get up?", hint: "palavra interrogativa", answers: ["what"], explain: "What time...?" },
  { id: "f22", prompt: "They ___ (be) happy yesterday.", hint: "passado do to be, plural", answers: ["were"], explain: "were." },
  { id: "f23", prompt: "She ___ (teach) at a school.", hint: "3ª pessoa", answers: ["teaches"], explain: "teach → teaches." },
  { id: "f24", prompt: "I would like to ___ (book) a table.", hint: "forma base", answers: ["book"], explain: "to book." },
  { id: "f25", prompt: "He ___ (not / can) come today.", hint: "modal negativo", answers: ["can't", "cannot"], explain: "can't come." },
  { id: "f26", prompt: "We ___ (see) a good film last week.", hint: "passado irregular", answers: ["saw"], explain: "see → saw." },
  { id: "f27", prompt: "Breakfast is ___ 7 ___ 10.", hint: "intervalo (duas palavras: ___ ___)", answers: ["from to", "from ... to"], explain: "from 7 to 10." },
  { id: "f28", prompt: "There isn't ___ milk.", hint: "negativa, incontável", answers: ["any"], explain: "isn't any." },
  { id: "f29", prompt: "My brother ___ (like) football.", hint: "3ª pessoa", answers: ["likes"], explain: "like → likes." },
  { id: "f30", prompt: "I'm ___ (read) a book now.", hint: "present continuous", answers: ["reading"], explain: "am reading." },
  { id: "f31", prompt: "She ___ (get) home late yesterday.", hint: "passado irregular", answers: ["got"], explain: "get → got." },
  { id: "f32", prompt: "How ___ is this shirt? (preço)", hint: "quantidade incontável", answers: ["much"], explain: "How much...?" },
];

const TRANSLATE_A2: Translate[] = [
  { id: "t1", pt: "Eu estudo inglês todos os dias.", answers: ["i study english every day"], explain: "I study English every day." },
  { id: "t2", pt: "Ela mora em São Paulo.", answers: ["she lives in são paulo", "she lives in sao paulo"], explain: "She lives in São Paulo." },
  { id: "t3", pt: "Eu tenho uma reserva.", answers: ["i have a reservation"], explain: "I have a reservation." },
  { id: "t4", pt: "Que horas é o café da manhã?", answers: ["what time is breakfast", "what time is the breakfast"], explain: "What time is breakfast?" },
  { id: "t5", pt: "Eles não gostam de peixe.", answers: ["they don't like fish", "they do not like fish"], explain: "They don't like fish." },
  { id: "t6", pt: "Nós fomos à praia ontem.", answers: ["we went to the beach yesterday"], explain: "We went to the beach yesterday." },
  { id: "t7", pt: "Você fala inglês?", answers: ["do you speak english"], explain: "Do you speak English?" },
  { id: "t8", pt: "Ela bebe café toda manhã.", answers: ["she drinks coffee every morning"], explain: "She drinks coffee every morning." },
  { id: "t9", pt: "Eu gostaria de uma mesa para dois.", answers: ["i'd like a table for two", "i would like a table for two"], explain: "I'd like a table for two." },
  { id: "t10", pt: "Onde fica a estação?", answers: ["where is the station"], explain: "Where is the station?" },
  { id: "t11", pt: "Ele não come carne.", answers: ["he doesn't eat meat", "he does not eat meat"], explain: "He doesn't eat meat." },
  { id: "t12", pt: "Nós vamos viajar semana que vem.", answers: ["we are going to travel next week", "we're going to travel next week"], explain: "We're going to travel next week." },
  { id: "t13", pt: "Eu acordo às seis horas.", answers: ["i wake up at six", "i wake up at six o'clock"], explain: "I wake up at six." },
  { id: "t14", pt: "Ela pode nadar muito bem.", answers: ["she can swim very well"], explain: "She can swim very well." },
  { id: "t15", pt: "Quanto custa o ingresso?", answers: ["how much is the ticket"], explain: "How much is the ticket?" },
  { id: "t16", pt: "Eu comprei um presente ontem.", answers: ["i bought a gift yesterday", "i bought a present yesterday"], explain: "I bought a gift yesterday." },
  { id: "t17", pt: "As chaves estão na mesa.", answers: ["the keys are on the table"], explain: "The keys are on the table." },
  { id: "t18", pt: "Você gosta de café?", answers: ["do you like coffee"], explain: "Do you like coffee?" },
  { id: "t19", pt: "Ele assistiu TV ontem à noite.", answers: ["he watched tv last night"], explain: "He watched TV last night." },
  { id: "t20", pt: "Eu não tenho tempo agora.", answers: ["i don't have time now", "i do not have time now"], explain: "I don't have time now." },
  { id: "t21", pt: "Poderia me trazer a conta?", answers: ["could you bring me the check", "could you bring the check", "could i have the check"], explain: "Could you bring me the check?" },
  { id: "t22", pt: "Ela estuda medicina.", answers: ["she studies medicine"], explain: "She studies medicine." },
  { id: "t23", pt: "Nós vimos um bom filme.", answers: ["we saw a good film", "we saw a good movie"], explain: "We saw a good film." },
  { id: "t24", pt: "Meu irmão gosta de futebol.", answers: ["my brother likes football", "my brother likes soccer"], explain: "My brother likes football." },
  { id: "t25", pt: "Estou lendo um livro agora.", answers: ["i'm reading a book now", "i am reading a book now"], explain: "I'm reading a book now." },
  { id: "t26", pt: "Ela chega às oito.", answers: ["she arrives at eight", "she arrives at eight o'clock"], explain: "She arrives at eight." },
  { id: "t27", pt: "Eu moro no Brasil.", answers: ["i live in brazil"], explain: "I live in Brazil." },
  { id: "t28", pt: "Não há leite.", answers: ["there isn't any milk", "there is no milk", "there is not any milk"], explain: "There isn't any milk." },
  { id: "t29", pt: "Você pode repetir, por favor?", answers: ["could you repeat that please", "can you repeat that please", "could you repeat please"], explain: "Could you repeat that, please?" },
  { id: "t30", pt: "Eu vou visitar minha avó.", answers: ["i'm going to visit my grandmother", "i am going to visit my grandmother"], explain: "I'm going to visit my grandmother." },
  { id: "t31", pt: "O restaurante fica perto do hotel.", answers: ["the restaurant is near the hotel"], explain: "The restaurant is near the hotel." },
  { id: "t32", pt: "Ela tem duas irmãs.", answers: ["she has two sisters"], explain: "She has two sisters." },
];

const ORDER_A2: Order[] = [
  { id: "o1", words: ["every", "she", "coffee", "drinks", "morning"], answer: "she drinks coffee every morning", pt: "Ela bebe café toda manhã." },
  { id: "o2", words: ["a", "have", "I", "reservation"], answer: "i have a reservation", pt: "Eu tenho uma reserva." },
  { id: "o3", words: ["you", "do", "English", "speak"], answer: "do you speak english", pt: "Você fala inglês?" },
  { id: "o4", words: ["went", "we", "the", "to", "beach"], answer: "we went to the beach", pt: "Nós fomos à praia." },
  { id: "o5", words: ["breakfast", "time", "what", "is"], answer: "what time is breakfast", pt: "Que horas é o café da manhã?" },
  { id: "o6", words: ["not", "does", "meat", "he", "eat"], answer: "he does not eat meat", pt: "Ele não come carne." },
  { id: "o7", words: ["table", "the", "keys", "on", "the", "are"], answer: "the keys are on the table", pt: "As chaves estão na mesa." },
  { id: "o8", words: ["swim", "she", "well", "can", "very"], answer: "she can swim very well", pt: "Ela pode nadar muito bem." },
  { id: "o9", words: ["in", "lives", "she", "São", "Paulo"], answer: "she lives in são paulo", pt: "Ela mora em São Paulo." },
  { id: "o10", words: ["a", "I'd", "table", "like", "for", "two"], answer: "i'd like a table for two", pt: "Eu gostaria de uma mesa para dois." },
  { id: "o11", words: ["the", "where", "station", "is"], answer: "where is the station", pt: "Onde fica a estação?" },
  { id: "o12", words: ["coffee", "you", "like", "do"], answer: "do you like coffee", pt: "Você gosta de café?" },
  { id: "o13", words: ["yesterday", "TV", "he", "watched"], answer: "he watched tv yesterday", pt: "Ele assistiu TV ontem." },
  { id: "o14", words: ["now", "time", "have", "I", "don't"], answer: "i don't have time now", pt: "Eu não tenho tempo agora." },
  { id: "o15", words: ["bought", "a", "I", "ticket"], answer: "i bought a ticket", pt: "Eu comprei um ingresso." },
  { id: "o16", words: ["study", "every", "I", "English", "day"], answer: "i study english every day", pt: "Eu estudo inglês todos os dias." },
  { id: "o17", words: ["up", "wake", "I", "at", "six"], answer: "i wake up at six", pt: "Eu acordo às seis." },
  { id: "o18", words: ["is", "much", "how", "ticket", "the"], answer: "how much is the ticket", pt: "Quanto custa o ingresso?" },
  { id: "o19", words: ["going", "we're", "travel", "to", "next", "week"], answer: "we're going to travel next week", pt: "Nós vamos viajar semana que vem." },
  { id: "o20", words: ["medicine", "she", "studies"], answer: "she studies medicine", pt: "Ela estuda medicina." },
  { id: "o21", words: ["fish", "they", "like", "don't"], answer: "they don't like fish", pt: "Eles não gostam de peixe." },
  { id: "o22", words: ["a", "reading", "I'm", "book"], answer: "i'm reading a book", pt: "Estou lendo um livro." },
  { id: "o23", words: ["at", "arrives", "she", "eight"], answer: "she arrives at eight", pt: "Ela chega às oito." },
  { id: "o24", words: ["Brazil", "live", "I", "in"], answer: "i live in brazil", pt: "Eu moro no Brasil." },
  { id: "o25", words: ["good", "we", "a", "saw", "film"], answer: "we saw a good film", pt: "Nós vimos um bom filme." },
  { id: "o26", words: ["football", "brother", "likes", "my"], answer: "my brother likes football", pt: "Meu irmão gosta de futebol." },
  { id: "o27", words: ["repeat", "you", "could", "that", "please"], answer: "could you repeat that please", pt: "Você pode repetir, por favor?" },
  { id: "o28", words: ["two", "has", "she", "sisters"], answer: "she has two sisters", pt: "Ela tem duas irmãs." },
  { id: "o29", words: ["visit", "going", "I'm", "to", "my", "grandmother"], answer: "i'm going to visit my grandmother", pt: "Eu vou visitar minha avó." },
  { id: "o30", words: ["near", "the", "restaurant", "the", "is", "hotel"], answer: "the restaurant is near the hotel", pt: "O restaurante fica perto do hotel." },
  { id: "o31", words: ["homework", "did", "his", "he"], answer: "he did his homework", pt: "Ele fez a lição de casa." },
  { id: "o32", words: ["happy", "were", "they", "yesterday"], answer: "they were happy yesterday", pt: "Eles estavam felizes ontem." },
];

// ================= B1 =================
// Temas: experiências, planos, conselhos, opiniões simples — present perfect,
// condicionais 1ª/2ª, modais de obrigação, voz passiva básica, relative clauses.

const MC_B1: MC[] = [
  { id: "b1-mc1", prompt: "I ___ never been to Japan.", options: ["have", "has", "had", "having"], answer: 0, explain: "Present perfect com I: have." },
  { id: "b1-mc2", prompt: "She has worked here ___ 2019.", options: ["for", "since", "from", "at"], answer: 1, explain: "since + ponto no tempo: since 2019." },
  { id: "b1-mc3", prompt: "If I ___ more money, I would travel more.", options: ["have", "had", "has", "will have"], answer: 1, explain: "2ª condicional: if + passado simples." },
  { id: "b1-mc4", prompt: "You ___ smoke in here — it's not allowed.", options: ["shouldn't", "mustn't", "don't have to", "can't"], answer: 1, explain: "mustn't = proibição." },
  { id: "b1-mc5", prompt: "This book was written ___ a famous author.", options: ["by", "from", "with", "of"], answer: 0, explain: "Voz passiva: agente introduzido por by." },
  { id: "b1-mc6", prompt: "He said he ___ tired.", options: ["is", "was", "be", "been"], answer: 1, explain: "Discurso indireto: presente vira passado (backshift)." },
  { id: "b1-mc7", prompt: "The woman ___ lives next door is a doctor.", options: ["who", "which", "whose", "where"], answer: 0, explain: "Pronome relativo para pessoas: who." },
  { id: "b1-mc8", prompt: "I enjoy ___ new places.", options: ["visit", "visiting", "to visit", "visited"], answer: 1, explain: "enjoy + gerúndio: visiting." },
  { id: "b1-mc9", prompt: "I ___ live in Rio, but now I live in São Paulo.", options: ["use to", "used to", "am used to", "was used"], answer: 1, explain: "used to + forma base, para hábito no passado." },
  { id: "b1-mc10", prompt: "We ___ to the cinema tonight — I already bought the tickets.", options: ["will go", "are going", "go", "went"], answer: 1, explain: "Plano já decidido: present continuous com valor de futuro." },
  { id: "b1-mc11", prompt: "This is the ___ restaurant I've ever been to.", options: ["good", "better", "best", "most good"], answer: 2, explain: "Superlativo irregular: best." },
  { id: "b1-mc12", prompt: "You've finished your homework, ___?", options: ["haven't you", "don't you", "didn't you", "aren't you"], answer: 0, explain: "Question tag acompanha o auxiliar da frase (present perfect): haven't you." },
];

const FILL_B1: Fill[] = [
  { id: "b1-f1", prompt: "I ___ (never / be) to Japan.", hint: "present perfect", answers: ["have never been", "'ve never been"], explain: "have never been." },
  { id: "b1-f2", prompt: "She ___ (work) here since 2019.", hint: "present perfect", answers: ["has worked"], explain: "has worked." },
  { id: "b1-f3", prompt: "If I ___ (have) more money, I would travel more.", hint: "2ª condicional", answers: ["had"], explain: "if + passado simples: had." },
  { id: "b1-f4", prompt: "You ___ (not / smoke) in here.", hint: "proibição", answers: ["mustn't smoke", "must not smoke"], explain: "mustn't smoke." },
  { id: "b1-f5", prompt: "This book ___ (write) by a famous author.", hint: "voz passiva, passado", answers: ["was written"], explain: "was written." },
  { id: "b1-f6", prompt: "He said he ___ (be) tired.", hint: "discurso indireto", answers: ["was"], explain: "backshift: was." },
  { id: "b1-f7", prompt: "The woman ___ (live) next door is a doctor.", hint: "relative clause + 3ª pessoa", answers: ["who lives", "that lives"], explain: "who lives." },
  { id: "b1-f8", prompt: "I enjoy ___ (visit) new places.", hint: "enjoy + gerúndio", answers: ["visiting"], explain: "visiting." },
  { id: "b1-f9", prompt: "I ___ (use) to live in Rio.", hint: "hábito no passado", answers: ["used"], explain: "used to." },
  { id: "b1-f10", prompt: "We ___ (go) to the cinema tonight.", hint: "plano já decidido", answers: ["are going", "'re going"], explain: "are going." },
  { id: "b1-f11", prompt: "This is the ___ (good) restaurant I've ever been to.", hint: "superlativo irregular", answers: ["best"], explain: "best." },
  { id: "b1-f12", prompt: "You've finished your homework, ___ you?", hint: "question tag", answers: ["haven't"], explain: "haven't you." },
];

const TRANSLATE_B1: Translate[] = [
  { id: "b1-t1", pt: "Eu nunca fui ao Japão.", answers: ["i've never been to japan", "i have never been to japan"], explain: "I've never been to Japan." },
  { id: "b1-t2", pt: "Ela trabalha aqui desde 2019.", answers: ["she has worked here since 2019", "she's worked here since 2019"], explain: "She has worked here since 2019." },
  { id: "b1-t3", pt: "Se eu tivesse mais dinheiro, eu viajaria mais.", answers: ["if i had more money, i would travel more", "if i had more money i would travel more"], explain: "If I had more money, I would travel more." },
  { id: "b1-t4", pt: "Você não pode fumar aqui.", answers: ["you mustn't smoke here", "you can't smoke here"], explain: "You mustn't smoke here." },
  { id: "b1-t5", pt: "Este livro foi escrito por um autor famoso.", answers: ["this book was written by a famous author"], explain: "This book was written by a famous author." },
  { id: "b1-t6", pt: "Ele disse que estava cansado.", answers: ["he said he was tired", "he said that he was tired"], explain: "He said he was tired." },
  { id: "b1-t7", pt: "A mulher que mora ao lado é médica.", answers: ["the woman who lives next door is a doctor", "the woman that lives next door is a doctor"], explain: "The woman who lives next door is a doctor." },
  { id: "b1-t8", pt: "Eu gosto de visitar lugares novos.", answers: ["i enjoy visiting new places"], explain: "I enjoy visiting new places." },
  { id: "b1-t9", pt: "Eu costumava morar no Rio.", answers: ["i used to live in rio"], explain: "I used to live in Rio." },
  { id: "b1-t10", pt: "Nós vamos ao cinema hoje à noite.", answers: ["we are going to the cinema tonight", "we're going to the cinema tonight"], explain: "We're going to the cinema tonight." },
  { id: "b1-t11", pt: "Este é o melhor restaurante que eu já fui.", answers: ["this is the best restaurant i've ever been to", "this is the best restaurant i have ever been to"], explain: "This is the best restaurant I've ever been to." },
  { id: "b1-t12", pt: "Você terminou o dever de casa, não terminou?", answers: ["you've finished your homework, haven't you", "you have finished your homework, haven't you"], explain: "You've finished your homework, haven't you?" },
];

const ORDER_B1: Order[] = [
  { id: "b1-o1", words: ["never", "I've", "Japan", "to", "been"], answer: "i've never been to japan", pt: "Eu nunca fui ao Japão." },
  { id: "b1-o2", words: ["has", "she", "here", "worked", "since", "2019"], answer: "she has worked here since 2019", pt: "Ela trabalha aqui desde 2019." },
  { id: "b1-o3", words: ["had", "if", "I", "more", "money", "I", "would", "travel", "more"], answer: "if i had more money i would travel more", pt: "Se eu tivesse mais dinheiro, eu viajaria mais." },
  { id: "b1-o4", words: ["mustn't", "you", "here", "smoke"], answer: "you mustn't smoke here", pt: "Você não pode fumar aqui." },
  { id: "b1-o5", words: ["book", "this", "written", "was", "by", "a", "famous", "author"], answer: "this book was written by a famous author", pt: "Este livro foi escrito por um autor famoso." },
  { id: "b1-o6", words: ["said", "he", "was", "he", "tired"], answer: "he said he was tired", pt: "Ele disse que estava cansado." },
  { id: "b1-o7", words: ["woman", "the", "who", "lives", "next", "door", "is", "a", "doctor"], answer: "the woman who lives next door is a doctor", pt: "A mulher que mora ao lado é médica." },
  { id: "b1-o8", words: ["enjoy", "I", "visiting", "places", "new"], answer: "i enjoy visiting new places", pt: "Eu gosto de visitar lugares novos." },
  { id: "b1-o9", words: ["used", "I", "to", "live", "in", "Rio"], answer: "i used to live in rio", pt: "Eu costumava morar no Rio." },
  { id: "b1-o10", words: ["going", "we", "are", "to", "the", "cinema", "tonight"], answer: "we are going to the cinema tonight", pt: "Nós vamos ao cinema hoje à noite." },
  { id: "b1-o11", words: ["is", "this", "the", "best", "restaurant", "I've", "ever", "been", "to"], answer: "this is the best restaurant i've ever been to", pt: "Este é o melhor restaurante que eu já fui." },
  { id: "b1-o12", words: ["finished", "you've", "your", "homework", "haven't", "you"], answer: "you've finished your homework haven't you", pt: "Você terminou o dever de casa, não terminou?" },
];

// ================= C1 =================
// Temas: trabalho, opiniões, notícias, negociações — gramática avançada
// (condicionais mistos, inversão, voz passiva, discurso indireto, coesão).

const MC_C1: MC[] = [
  { id: "c1-mc1", prompt: "Had I known about the delay, I ___ earlier.", options: ["would leave", "would have left", "had left", "was leaving"], answer: 1, explain: "3ª condicional invertida (Had I known = If I had known): would have left." },
  { id: "c1-mc2", prompt: "We ___ the report by the time you arrive.", options: ["will finish", "will have finished", "finish", "are finishing"], answer: 1, explain: "Future perfect: ação concluída antes de outro momento futuro." },
  { id: "c1-mc3", prompt: "She admitted ___ the vase, though she tried to blame the cat.", options: ["to break", "breaking", "broke", "break"], answer: 1, explain: "admit + gerúndio: admitted breaking." },
  { id: "c1-mc4", prompt: "___ the pandemic, the company managed to grow.", options: ["Despite of", "In spite", "Despite", "Although of"], answer: 2, explain: "Despite + substantivo, sem 'of'." },
  { id: "c1-mc5", prompt: "He must ___ the email — I can see it in his sent folder.", options: ["send", "have sent", "be sending", "sent"], answer: 1, explain: "Modal de dedução no passado: must have sent." },
  { id: "c1-mc6", prompt: "The bridge, ___ was built in 1889, is now a tourist attraction.", options: ["that", "which", "who", "what"], answer: 1, explain: "Oração relativa não-restritiva (com vírgulas) usa which, não that." },
  { id: "c1-mc7", prompt: "Not until she apologized ___ willing to speak to her.", options: ["I was", "was I", "I am", "am I"], answer: 1, explain: "Inversão depois de advérbio negativo no início: Not until... was I." },
  { id: "c1-mc8", prompt: "The new policy has come ___ a lot of criticism.", options: ["under", "over", "across", "along"], answer: 0, explain: "Collocation: come under criticism." },
  { id: "c1-mc9", prompt: "If the manager had listened to us, the project ___ on time.", options: ["would finish", "would have finished", "finished", "will finish"], answer: 1, explain: "3ª condicional: if + past perfect, would have + particípio." },
  { id: "c1-mc10", prompt: "It's about time you ___ some responsibility for your actions.", options: ["take", "took", "taken", "will take"], answer: 1, explain: "'It's (about) time' + passado simples, com sentido de presente/cobrança." },
  { id: "c1-mc11", prompt: "The committee is looking ___ several proposals before deciding.", options: ["into", "for", "at", "up"], answer: 0, explain: "look into = investigar, analisar." },
  { id: "c1-mc12", prompt: "Rarely ___ such a compelling argument.", options: ["I have heard", "have I heard", "I heard", "did I hear"], answer: 1, explain: "Inversão depois de advérbio de frequência negativo (Rarely) no início da frase." },
];

const FILL_C1: Fill[] = [
  { id: "c1-f1", prompt: "If she ___ (know) about the meeting, she would have attended.", hint: "3ª condicional", answers: ["had known"], explain: "If + past perfect: had known." },
  { id: "c1-f2", prompt: "The results ___ (announce) next week.", hint: "voz passiva, futuro", answers: ["will be announced"], explain: "Futuro passivo: will be announced." },
  { id: "c1-f3", prompt: "He denied ___ (take) the money.", hint: "deny + gerúndio", answers: ["taking"], explain: "deny + -ing: denied taking." },
  { id: "c1-f4", prompt: "___ (Not / only) did he arrive late, he also forgot his notes.", hint: "inversão no início da frase", answers: ["Not only", "not only"], explain: "Not only + inversão (did he arrive)." },
  { id: "c1-f5", prompt: "By next year, she ___ (work) here for a decade.", hint: "future perfect", answers: ["will have worked"], explain: "will have + particípio: will have worked." },
  { id: "c1-f6", prompt: "The manager insisted that the report ___ (submit) by Friday.", hint: "subjuntivo depois de insist that", answers: ["be submitted"], explain: "insist that + sujeito + forma base (subjuntivo): be submitted." },
  { id: "c1-f7", prompt: "I'd rather you ___ (not / mention) this to anyone.", hint: "would rather + passado simples", answers: ["didn't mention", "did not mention"], explain: "would rather + passado simples com sentido de presente." },
  { id: "c1-f8", prompt: "Scarcely ___ (he / sit) down when the phone rang.", hint: "inversão com scarcely", answers: ["had he sat"], explain: "Scarcely + inversão: had he sat." },
  { id: "c1-f9", prompt: "The findings, ___ surprised everyone, will be published soon.", hint: "pronome relativo (oração não-restritiva)", answers: ["which"], explain: "which, para retomar 'the findings' numa oração não-restritiva." },
  { id: "c1-f10", prompt: "She's used to ___ (work) under pressure.", hint: "used to + gerúndio", answers: ["working"], explain: "be used to + -ing: used to working." },
  { id: "c1-f11", prompt: "It's high time the company ___ (update) its policies.", hint: "it's (high) time + passado simples", answers: ["updated"], explain: "it's high time + passado simples: updated." },
  { id: "c1-f12", prompt: "Were it not for his support, the project ___ (fail).", hint: "condicional invertido", answers: ["would have failed"], explain: "Were it not for = If it weren't for; consequência: would have failed." },
];

const TRANSLATE_C1: Translate[] = [
  { id: "c1-t1", pt: "Se eu tivesse sabido, eu teria ajudado.", answers: ["if i had known, i would have helped", "if i had known i would have helped", "had i known, i would have helped", "had i known i would have helped"], explain: "If I had known, I would have helped. / Had I known, I would have helped." },
  { id: "c1-t2", pt: "Ele admitiu ter cometido um erro.", answers: ["he admitted making a mistake", "he admitted to making a mistake"], explain: "He admitted making a mistake." },
  { id: "c1-t3", pt: "Mal ela tinha chegado quando o telefone tocou.", answers: ["hardly had she arrived when the phone rang", "no sooner had she arrived than the phone rang"], explain: "Hardly had she arrived when the phone rang." },
  { id: "c1-t4", pt: "Está na hora de você assumir mais responsabilidade.", answers: ["it's time you took more responsibility", "it's about time you took more responsibility", "it is time you took more responsibility"], explain: "It's (about) time you took more responsibility." },
  { id: "c1-t5", pt: "O relatório será divulgado até sexta-feira.", answers: ["the report will be released by friday", "the report will have been released by friday"], explain: "The report will be released by Friday." },
  { id: "c1-t6", pt: "Ela é acostumada a trabalhar sob pressão.", answers: ["she's used to working under pressure", "she is used to working under pressure"], explain: "She's used to working under pressure." },
  { id: "c1-t7", pt: "Não fosse pela sua ajuda, eu teria falhado.", answers: ["were it not for your help, i would have failed", "were it not for your help i would have failed", "if it weren't for your help, i would have failed", "if it weren't for your help i would have failed"], explain: "Were it not for your help, I would have failed." },
  { id: "c1-t8", pt: "Ele insistiu que a reunião fosse adiada.", answers: ["he insisted that the meeting be postponed"], explain: "He insisted that the meeting be postponed." },
  { id: "c1-t9", pt: "Raramente vi um argumento tão convincente.", answers: ["rarely have i seen such a compelling argument", "i have rarely seen such a compelling argument"], explain: "Rarely have I seen such a compelling argument." },
  { id: "c1-t10", pt: "A ponte, que foi construída em 1889, é um ponto turístico.", answers: ["the bridge, which was built in 1889, is a tourist attraction", "the bridge which was built in 1889 is a tourist attraction"], explain: "The bridge, which was built in 1889, is a tourist attraction." },
  { id: "c1-t11", pt: "Prefiro que você não mencione isso.", answers: ["i'd rather you didn't mention this", "i would rather you didn't mention this"], explain: "I'd rather you didn't mention this." },
  { id: "c1-t12", pt: "A nova política recebeu muitas críticas.", answers: ["the new policy has come under a lot of criticism", "the new policy received a lot of criticism"], explain: "The new policy has come under a lot of criticism." },
];

const ORDER_C1: Order[] = [
  { id: "c1-o1", words: ["would", "known", "have", "had", "I", "helped", "I"], answer: "had i known i would have helped", pt: "Se eu tivesse sabido, eu teria ajudado." },
  { id: "c1-o2", words: ["making", "mistake", "she", "a", "admitted"], answer: "she admitted making a mistake", pt: "Ela admitiu ter cometido um erro." },
  { id: "c1-o3", words: ["had", "hardly", "she", "arrived", "when", "rang", "the", "phone"], answer: "hardly had she arrived when the phone rang", pt: "Mal ela tinha chegado quando o telefone tocou." },
  { id: "c1-o4", words: ["time", "it's", "you", "took", "responsibility", "more"], answer: "it's time you took more responsibility", pt: "Está na hora de você assumir mais responsabilidade." },
  { id: "c1-o5", words: ["report", "the", "will", "released", "have", "been", "by", "Friday"], answer: "the report will have been released by friday", pt: "O relatório será divulgado até sexta-feira." },
  { id: "c1-o6", words: ["used", "she's", "working", "under", "to", "pressure"], answer: "she's used to working under pressure", pt: "Ela é acostumada a trabalhar sob pressão." },
  { id: "c1-o7", words: ["it", "were", "help", "not", "your", "for", "would", "have", "failed", "I"], answer: "were it not for your help i would have failed", pt: "Não fosse pela sua ajuda, eu teria falhado." },
  { id: "c1-o8", words: ["insisted", "he", "meeting", "that", "postponed", "be", "the"], answer: "he insisted that the meeting be postponed", pt: "Ele insistiu que a reunião fosse adiada." },
  { id: "c1-o9", words: ["have", "rarely", "seen", "I", "argument", "compelling", "a", "such"], answer: "rarely have i seen such a compelling argument", pt: "Raramente vi um argumento tão convincente." },
  { id: "c1-o10", words: ["bridge", "the", "was", "which", "built", "in", "1889", "is", "attraction", "a", "tourist"], answer: "the bridge which was built in 1889 is a tourist attraction", pt: "A ponte, que foi construída em 1889, é um ponto turístico." },
  { id: "c1-o11", words: ["rather", "I'd", "didn't", "mention", "you", "this"], answer: "i'd rather you didn't mention this", pt: "Prefiro que você não mencione isso." },
  { id: "c1-o12", words: ["policy", "the", "new", "come", "has", "under", "criticism", "a", "lot", "of"], answer: "the new policy has come under a lot of criticism", pt: "A nova política recebeu muitas críticas." },
];

const EMPTY_BANK: LevelBank = { mc: [], fill: [], translate: [], order: [] };

export const EXERCISES: Record<CefrLevel, LevelBank> = {
  A1: EMPTY_BANK,
  A2: { mc: MC_A2, fill: FILL_A2, translate: TRANSLATE_A2, order: ORDER_A2 },
  B1: { mc: MC_B1, fill: FILL_B1, translate: TRANSLATE_B1, order: ORDER_B1 },
  B2: EMPTY_BANK,
  C1: { mc: MC_C1, fill: FILL_C1, translate: TRANSLATE_C1, order: ORDER_C1 },
  C2: EMPTY_BANK,
};

export const CATEGORY_META: Record<Kind, { title: string; desc: string }> = {
  mc: { title: "Múltipla escolha", desc: "Escolha a opção correta em frases de gramática e vocabulário." },
  fill: { title: "Completar a lacuna", desc: "Complete a frase com a forma certa do verbo ou palavra." },
  translate: { title: "Tradução PT → EN", desc: "Traduza a frase para o inglês." },
  order: { title: "Ordenar palavras", desc: "Toque nas palavras para montar a frase correta." },
};

export function levelHasContent(level: CefrLevel): boolean {
  const bank = EXERCISES[level];
  return bank.mc.length > 0 || bank.fill.length > 0 || bank.translate.length > 0 || bank.order.length > 0;
}

/** Nível de exercícios a mostrar: o do aluno, ou o mais próximo já populado. */
export function resolveExerciseLevel(level: CefrLevel): CefrLevel {
  return nearestLevelWithContent(level, levelHasContent, "A2");
}

export function categoriesFor(level: CefrLevel): { kind: Kind; title: string; desc: string; count: number }[] {
  const bank = EXERCISES[level];
  return (Object.keys(CATEGORY_META) as Kind[]).map((kind) => ({
    kind,
    ...CATEGORY_META[kind],
    count: bank[kind].length,
  }));
}

export function normalize(s: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;]/g, "")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ");
}
