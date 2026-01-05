"use client";
import BackButton from "../components/BackButton";

export default function AboutPageClient() {
  return (
    <main className="max-w-3xl mx-auto px-6">
      <BackButton className="mb-4 -ml-50" />
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
    </main>
  );
}
