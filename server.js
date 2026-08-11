// Servidor de produção pra hospedagem cPanel (Setup Node.js App / Passenger).
// O Passenger define a porta em process.env.PORT e espera um servidor HTTP
// comum escutando nela — por isso não usamos "next start" direto, e sim a
// API programática do Next pra criar esse servidor.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Central School rodando na porta ${port}`);
  });
});
