// Leitura das variáveis de ambiente de rede. Fica isolada do app.js para poder ser testada
// sem subir o servidor, e falha cedo com mensagem clara em vez de rodar mal configurada.

export const DEFAULT_CORS_ORIGIN = "http://localhost:3000";

// CORS_ORIGIN aceita várias origens separadas por vírgula. A barra no fim é removida porque o
// cabeçalho Origin do navegador nunca a traz, e colar a URL com barra é erro comum no painel.
export function parseOrigins(value) {
  const origins = (value ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return origins.length > 0 ? origins : [DEFAULT_CORS_ORIGIN];
}

function parseInteger(name, value, { min, max }) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${name} inválida: "${value}". Esperado um inteiro entre ${min} e ${max}.`);
  }
  return number;
}

// A Render (e a maioria das hospedagens) define PORT; local cai no padrão
export function parsePort(value, fallback = 3333) {
  if (value === undefined || value === "") return fallback;
  return parseInteger("PORT", value, { min: 1, max: 65535 });
}

// Quantos proxies existem na frente do app. Sem isso o limite de requisições enxerga o IP do
// proxy, e todos os visitantes passam a dividir o mesmo limite. Indefinido = sem proxy.
export function parseTrustProxy(value) {
  if (value === undefined || value === "") return undefined;
  return parseInteger("TRUST_PROXY", value, { min: 0, max: 10 });
}
