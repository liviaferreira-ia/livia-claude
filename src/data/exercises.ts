// Banco de exercícios — nível A2. Cada tipo tem 30+ itens.
// Temas: apresentações, rotina, hotel, restaurante, viagem, compras, direções.

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

export const MULTIPLE_CHOICE: MC[] = [
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

export const FILL: Fill[] = [
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

export const TRANSLATE: Translate[] = [
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

export const ORDER: Order[] = [
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

export const CATEGORIES: {
  kind: Kind;
  title: string;
  desc: string;
  count: number;
}[] = [
  { kind: "mc", title: "Múltipla escolha", desc: "Escolha a opção correta em frases de gramática e vocabulário.", count: MULTIPLE_CHOICE.length },
  { kind: "fill", title: "Completar a lacuna", desc: "Complete a frase com a forma certa do verbo ou palavra.", count: FILL.length },
  { kind: "translate", title: "Tradução PT → EN", desc: "Traduza a frase para o inglês.", count: TRANSLATE.length },
  { kind: "order", title: "Ordenar palavras", desc: "Toque nas palavras para montar a frase correta.", count: ORDER.length },
];

export function normalize(s: string) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;]/g, "")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ");
}
