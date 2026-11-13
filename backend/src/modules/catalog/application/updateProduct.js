import { AppError } from "../../../shared/errors/AppError.js";
import { toProduct } from "../domain/Product.js";

export function makeUpdateProduct({ productRepository }) {
  return async function updateProduct(id, data) {
    const row = await productRepository.update(id, data);

    if (!row) {
      throw new AppError(404, "Product not found");
    }

    return toProduct(row);
  };
}
