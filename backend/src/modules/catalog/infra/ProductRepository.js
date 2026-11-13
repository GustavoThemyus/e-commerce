export function createProductRepository(pool) {
  return {
    async findAll() {
      const result = await pool.query("SELECT * FROM products");
      return result.rows;
    },

    async findById(id) {
      const result = await pool.query("SELECT * FROM products WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    },

    async findByIds(ids) {
      const result = await pool.query(
        "SELECT * FROM products WHERE id = ANY($1::int[])",
        [ids],
      );
      return result.rows;
    },

    async findTopRated(limit, excludeIds = []) {
      const result = await pool.query(
        `SELECT * FROM products
         WHERE NOT (id = ANY($2::int[]))
         ORDER BY rating_rate DESC, rating_count DESC, id
         LIMIT $1`,
        [limit, excludeIds],
      );
      return result.rows;
    },

    async create({ title, price, description, category, image }) {
      const result = await pool.query(
        `INSERT INTO products (title, price, description, category, image)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [title, price, description, category, image],
      );
      return result.rows[0];
    },

    async update(id, { title, price, description, category, image }) {
      const result = await pool.query(
        `UPDATE products
         SET title = $2, price = $3, description = $4, category = $5, image = $6
         WHERE id = $1
         RETURNING *`,
        [id, title, price, description, category, image],
      );
      return result.rows[0];
    },
  };
}
