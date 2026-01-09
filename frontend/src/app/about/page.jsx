import AboutPageClient from "./AboutPageClient";
import CommentsSection from "./components/CommentsSection";
import BackButton from "../components/BackButton";

export const metadata = {
  title: "About | E-Commerce",
  description: "Learn more about this project and leave your feedback",
};

export default async function AboutPage() {
  return (
    <main className="py-8 min-h-screen space-y-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AboutPageClient />
        <CommentsSection />
      </div>
    </main>
  );
}
