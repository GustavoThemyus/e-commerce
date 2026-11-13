import { toProduct } from "../domain/Product.js";

export function makeCreateProduct({ productRepository }) {
  return async function createProduct(data) {
    return toProduct(await productRepository.create(data));
  };
}
