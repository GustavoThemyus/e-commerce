export class Cart {
  #items = [];

  get items() {
    return this.#items;
  }

  add(product, quantity) {
    const existing = this.#items.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.#items.push({ ...product, quantity });
    }
  }

  update(id, quantity) {
    this.#items = this.#items.map((item) =>
      item.id === id ? { ...item, quantity } : item,
    );
  }

  remove(id) {
    this.#items = this.#items.filter((item) => item.id !== Number(id));
  }

  clear() {
    this.#items = [];
  }
}
