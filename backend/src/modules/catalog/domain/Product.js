// A linha do banco usa colunas planas (rating_rate, rating_count); a API expõe rating aninhado
export function toProduct(row) {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    description: row.description,
    category: row.category,
    image: row.image,
    rating: {
      rate: Number(row.rating_rate),
      count: row.rating_count,
    },
    created_at: row.created_at,
  };
}
