-- Itens de cada compra em linhas (sale_id, product_id, quantity), a base das recomendações.
-- O JSONB em sales.items continua como snapshot de título e preço no momento da compra.
-- Idempotente. Mesmo comando da 001, trocando o arquivo.

CREATE TABLE IF NOT EXISTS sale_items (
  sale_id    INTEGER NOT NULL REFERENCES sales(id)    ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (sale_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Backfill das compras antigas. O JSONB tem dois formatos: `id` (primeiros testes) e
-- `productId` (frontend). Linhas inválidas ou de produto removido são ignoradas, e produtos
-- repetidos na mesma compra somam a quantidade. Os CASE evitam cast de texto inválido, já que
-- o Postgres não garante que o filtro rode antes da conversão.
WITH raw AS (
  SELECT s.id AS sale_id,
         CASE WHEN COALESCE(i->>'productId', i->>'id') ~ '^\d{1,9}$'
              THEN COALESCE(i->>'productId', i->>'id')::int END AS product_id,
         CASE WHEN i->>'quantity' ~ '^\d{1,6}$'
              THEN (i->>'quantity')::int END AS quantity
  FROM sales s
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(s.items) = 'array' THEN s.items ELSE '[]'::jsonb END
  ) AS i
)
INSERT INTO sale_items (sale_id, product_id, quantity)
SELECT raw.sale_id, raw.product_id, SUM(raw.quantity)
FROM raw
JOIN products p ON p.id = raw.product_id
WHERE raw.quantity > 0
GROUP BY raw.sale_id, raw.product_id
ON CONFLICT DO NOTHING;
