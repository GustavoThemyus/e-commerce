import pool from "../config/database.js";

export async function getAllProducts() {
  const result = await pool.query("SELECT * FROM products");
  return result.rows;
}

export async function getProductById(id) {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

  return result.rows[0];
}
