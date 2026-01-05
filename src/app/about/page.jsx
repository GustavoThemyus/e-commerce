import CommentsSection from "./CommentsSection";

export const metadata = {
  // Informações adicionais que descrevem o conteúdo de uma página
  title: "About | E-Commerce",
  description: "Learn more about this project and leave your feedback",
};

export default async function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">About this project</h1>
        <p className="text-neutral-700 leading-relaxed">
          This e-commerce project was built to practice modern React, Next.js
          App Router, Server Components, and clean UI architecture.
        </p>
        <p className="text-neutral-700 leading-relaxed">
          The focus is on performance, simplicity, and maintainability.
        </p>
      </section>

      <CommentsSection />
    </main>
  );
}
