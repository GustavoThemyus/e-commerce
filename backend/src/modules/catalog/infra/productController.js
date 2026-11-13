import { getAllProducts, getProductById } from "../models/productModel.js";

export async function listProducts(req, res) {
  try {
    const products = await getAllProducts();

    const formattedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      description: product.description,
      category: product.category,
      image: product.image,
      rating: {
        rate: Number(product.rating_rate),
        count: product.rating_count,
      },
      created_at: product.created_at,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found " });
    }

    const formattedProduct = {
      id: product.id,
      title: product.title,
      price: Number(product.price),
      description: product.description,
      category: product.category,
      image: product.image,
      rating: {
        rate: Number(product.rating_rate),
        count: product.rating_count,
      },
      created_at: product.created_at,
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}
