// Mapeia os itens e renderiza CartItem pra cada um
import CartItem from "./CartItem";

export default function CartList({ products }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8 md:gap-10">
      {products.map((product) => (
        <CartItem key={product.id || index} product={product} />
      ))}
    </div>
  );
}
