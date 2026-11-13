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
    async save(order) {
      await pool.query(
        "INSERT INTO sales (customer_email, total, items, user_id) VALUES ($1, $2, $3, $4)",
        [order.customerEmail, order.total, JSON.stringify(order.items), order.userId],
      );
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
