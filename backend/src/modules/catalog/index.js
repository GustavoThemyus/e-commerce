import { createProductRepository } from "./infra/ProductRepository.js";
import { makeListProducts } from "./application/listProducts.js";
import { makeGetProduct } from "./application/getProduct.js";
import { makeCreateProduct } from "./application/createProduct.js";
import { makeUpdateProduct } from "./application/updateProduct.js";
import { toProduct } from "./domain/Product.js";
import { createProductController } from "./infra/productController.js";
import { createProductRoutes } from "./infra/productRoutes.js";

export function createCatalogModule({ pool, auth }) {
  const productRepository = createProductRepository(pool);

  const controller = createProductController({
    listProducts: makeListProducts({ productRepository }),
    getProduct: makeGetProduct({ productRepository }),
    createProduct: makeCreateProduct({ productRepository }),
    updateProduct: makeUpdateProduct({ productRepository }),
  });

  return {
    router: createProductRoutes(controller, auth),

    // Consulta que outros contextos (pedidos) usam para ler preços reais
    productCatalog: {
      async findByIds(ids) {
        return (await productRepository.findByIds(ids)).map(toProduct);
      },
    },
  };
}
