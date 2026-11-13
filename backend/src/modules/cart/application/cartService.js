// Um único carrinho compartilhado, em memória: ainda não existe usuário para dono dele
export function createCartService({ cart }) {
  return {
    get: () => cart.items,

    add(product, quantity) {
      cart.add(product, quantity);
      return cart.items;
    },

    update(id, quantity) {
      cart.update(id, quantity);
      return cart.items;
    },

    remove(id) {
      cart.remove(id);
      return cart.items;
    },

    clear: () => cart.clear(),
  };
}
