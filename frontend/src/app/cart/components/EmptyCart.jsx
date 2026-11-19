import Link from "next/link";
import { CheckCircle } from "lucide-react";

// `notice`: confirmação de uma compra recém-concluída (o carrinho esvaziou por causa dela)
export default function EmptyCart({ notice }) {
  return (
    <main className="text-black text-center min-h-screen flex flex-col items-center justify-center py-16">
      <div className="flex flex-col gap-6 sm:gap-8 items-center">
        {notice && (
          <p
            role="status"
            className="flex items-center gap-2 text-emerald-600 text-sm sm:text-base"
          >
            <CheckCircle className="w-5 h-5" />
            {notice}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl">Cart empty</h2>
          <p>Add products</p>
        </div>
        <div>
          <Link
            href="/"
            className="hover:brightness-95 active:brightness-90 bg-zinc-950 text-white px-4 py-2 rounded-md shadow"
          >
            Go to store
          </Link>
        </div>
      </div>
    </main>
  );
}
