/** CPF e telefone pedidos no cadastro do teste grátis (para a cobrança, se o aluno continuar). */

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** 000.000.000-00 enquanto o aluno digita. */
export function formatCpf(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

/** (11) 98765-4321 enquanto o aluno digita. */
export function formatPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Confere os dígitos verificadores (a mesma regra roda no banco, em cpf_valido). */
export function isValidCpf(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

/** Celular ou fixo com DDD (10 ou 11 dígitos). */
export const isValidPhone = (value: string) => onlyDigits(value).length >= 10;

/** Traduz os erros de save_billing_contact para o aluno. */
export function billingContactError(message: string | null | undefined): string {
  const m = message ?? "";
  if (m.includes("cpf_em_uso")) return "Este CPF já está cadastrado em outra conta. Se for seu, entre com a conta que você já tem ou fale com a escola.";
  if (m.includes("cpf_invalido")) return "Confira o CPF: os números não conferem.";
  if (m.includes("telefone_invalido")) return "Informe o WhatsApp com DDD.";
  return "Não consegui salvar seus dados agora. Tente de novo em instantes.";
}
