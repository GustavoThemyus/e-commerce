import Link from "next/link";

export default function EmptyCart() {
  return (
    <main className="text-black text-center min-h-screen flex flex-col items-center justify-center py-16">
      <div className="flex flex-col gap-6 sm:gap-8 items-center">
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
