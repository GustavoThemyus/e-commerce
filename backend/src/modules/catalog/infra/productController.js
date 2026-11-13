import { AppError } from "../../../shared/errors/AppError.js";

// Id que não é inteiro positivo nunca existe: 404, em vez de deixar o Postgres rejeitar o cast
function parseId(param) {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(404, "Product not found");
  }
  return id;
}

// Só campos editáveis: id, rating e created_at não entram pelo corpo da requisição
function editableFields(body) {
  const { title, price, description, category, image } = body;
  return {
    title,
    price,
    description: description ?? null,
    category: category ?? null,
    image: image ?? null,
  };
}

export function createProductController({
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
}) {
  return {
    async list(req, res) {
      res.json(await listProducts());
    },

    async get(req, res) {
      res.json(await getProduct(parseId(req.params.id)));
    },

    async create(req, res) {
      res.status(201).json(await createProduct(editableFields(req.body)));
    },

    async update(req, res) {
      res.json(
        await updateProduct(parseId(req.params.id), editableFields(req.body)),
      );
    },
  };
}
