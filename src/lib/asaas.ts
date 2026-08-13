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

export type AsaasPayment = {
  id: string;
  customer: string;
  subscription?: string | null;
  billingType?: string | null;
  status: string;
  value?: number;
  netValue?: number | null;
  dueDate?: string | null;
  paymentDate?: string | null;
  confirmedDate?: string | null;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  description?: string | null;
};

/** Lista todas as cobranças de um cliente, percorrendo a paginação do Asaas. */
export async function listAsaasPayments(customerId: string): Promise<AsaasPayment[]> {
  const payments: AsaasPayment[] = [];
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({ customer: customerId, limit: String(limit), offset: String(offset) });
    const res = await fetch(`${BASE_URL}/payments?${params}`, {
      headers: { access_token: apiKey() },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Asaas: não consegui listar cobranças de ${customerId} (HTTP ${res.status})`);
    }
    const page = (await res.json()) as { data?: AsaasPayment[]; hasMore?: boolean };
    payments.push(...(page.data ?? []));
    hasMore = Boolean(page.hasMore);
    offset += limit;
  }

  return payments;
}
