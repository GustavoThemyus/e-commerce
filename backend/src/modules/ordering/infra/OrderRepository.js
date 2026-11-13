function toOrderView(row) {
  return {
    id: row.id,
    customer_email: row.customer_email,
    total: Number(row.total),
    items: row.items,
    created_at: row.created_at,
  };
}

const COLUMNS = "id, customer_email, total, items, created_at";

export function createOrderRepository(pool) {
  return {
    // Compra e itens gravados juntos: ou entram os dois, ou nenhum
    async save(order) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const sale = await client.query(
          `INSERT INTO sales (customer_email, total, items, user_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [order.customerEmail, order.total, JSON.stringify(order.items), order.userId],
        );

        const quantities = order.quantityByProduct;
        await client.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity)
           SELECT $1, product_id, quantity
           FROM unnest($2::int[], $3::int[]) AS t(product_id, quantity)`,
          [sale.rows[0].id, [...quantities.keys()], [...quantities.values()]],
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },

    async findAll() {
      const result = await pool.query(
        `SELECT ${COLUMNS} FROM sales ORDER BY created_at DESC, id DESC`,
      );
      return result.rows.map(toOrderView);
    },

    async findByUserId(userId) {
      const result = await pool.query(
        `SELECT ${COLUMNS} FROM sales WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
        [userId],
      );
      return result.rows.map(toOrderView);
    },
  };
}
