export function createCartController({ cartService }) {
  return {
    get(req, res) {
      res.json(cartService.get());
    },

    add(req, res) {
      const { product, quantity } = req.body;
      res.status(201).json(cartService.add(product, quantity));
    },

    update(req, res) {
      const { id, quantity } = req.body;
      res.json(cartService.update(id, quantity));
    },

    remove(req, res) {
      res.json(cartService.remove(req.params.id));
    },
  };
}
