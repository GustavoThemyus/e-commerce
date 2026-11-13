import { AppError } from "../../../shared/errors/AppError.js";
import { toProduct } from "../domain/Product.js";

export function makeGetProduct({ productRepository }) {
  return async function getProduct(id) {
    const row = await productRepository.findById(id);

    if (!row) {
      throw new AppError(404, "Product not found");
    }

    return toProduct(row);
  };
}
