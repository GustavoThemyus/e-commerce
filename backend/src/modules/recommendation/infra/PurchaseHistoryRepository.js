// Modelo de leitura sobre as tabelas do contexto de pedidos (sales e sale_items).
// O comprador é identificado pelo e-mail: compra logada usa o e-mail da conta, então convidado
// e usuário cadastrado com o mesmo e-mail viram a mesma pessoa.
export function createPurchaseHistoryRepository(pool) {
  return {
    // Map e-mail -> ids dos produtos que a pessoa já comprou
    async findBaskets() {
      const result = await pool.query(
        `SELECT lower(s.customer_email) AS buyer,
                array_agg(DISTINCT si.product_id) AS product_ids
         FROM sales s
         JOIN sale_items si ON si.sale_id = s.id
         GROUP BY lower(s.customer_email)`,
      );
      return new Map(result.rows.map((row) => [row.buyer, row.product_ids]));
    },
  };
}
