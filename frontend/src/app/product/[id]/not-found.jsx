import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <h2 className="text-3xl mb-4">Product not found</h2>
        <p className="text-neutral-950 mb-6">We couldn't load this product</p>
        <Link
          href="/"
          className="rounded-3xl mt-4 font-bold text-white bg-orange-600 hover:brightness-95 py-3 px-4"
        >
          ← Back to Store
        </Link>
      </div>
    </main>
  );
}
