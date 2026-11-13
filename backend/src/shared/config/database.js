import pkg from "pg";
const { Pool } = pkg;

// Conexão vem do .env: este arquivo vai pro git, o .env não
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não definida. Copie backend/.env.example para backend/.env e preencha a connection string.",
  );
}

// Placeholder não substituído: sem isso o pg quebra com erro interno na 1a query
if (/[<>]/.test(connectionString) || /\[YOUR-PASSWORD\]/i.test(connectionString)) {
  throw new Error(
    "DATABASE_URL ainda tem o placeholder do .env.example. Troque <ref>, <senha> e <regiao> pelos dados do seu banco, e substitua o [YOUR-PASSWORD] inteiro (colchetes incluídos) pela senha.",
  );
}

try {
  new URL(connectionString);
} catch {
  throw new Error(
    "DATABASE_URL não é uma URI válida. Formato: postgresql://usuario:senha@host:porta/banco",
  );
}

// Banco na nuvem exige SSL, local não
const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Evita que erro em conexão ociosa derrube o processo
pool.on("error", (err) => {
  console.error("Erro inesperado no pool do Postgres:", err.message);
});

export default pool;
