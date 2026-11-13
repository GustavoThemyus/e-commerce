import { toProduct } from "../domain/Product.js";

export function makeListProducts({ productRepository }) {
  return async function listProducts() {
    const rows = await productRepository.findAll();
    return rows.map(toProduct);
  };
}
