import "server-only";

const BASE_URL = process.env.ASAAS_API_BASE_URL || "https://api.asaas.com/v3";

function apiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurada no servidor.");
  return key;
}

export type AsaasCustomer = {
  id: string;
  name: string;
  email: string | null;
  mobilePhone: string | null;
};

/** Busca os dados do cliente no Asaas (nome, e-mail) a partir do id recebido no webhook. */
export async function getAsaasCustomer(customerId: string): Promise<AsaasCustomer> {
  const res = await fetch(`${BASE_URL}/customers/${customerId}`, {
    headers: { access_token: apiKey() },
  });
  if (!res.ok) {
    throw new Error(`Asaas: não consegui buscar o cliente ${customerId} (HTTP ${res.status})`);
  }
  return res.json();
}
