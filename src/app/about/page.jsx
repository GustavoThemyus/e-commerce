import AboutPageClient from "./AboutPageClient";
import CommentsSection from "./components/CommentsSection";
import BackButton from "../components/BackButton";

export const metadata = {
  title: "About | E-Commerce",
  description: "Learn more about this project and leave your feedback",
};

export default async function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <AboutPageClient />
      <CommentsSection />
    </main>
  );
}
