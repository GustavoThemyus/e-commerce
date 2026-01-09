"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton({ className = "" }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center gap-1 text-neutral-800 cursor-pointer hover:text-black hover:underline transition ${className}`}
    >
      <ChevronLeft size={20} />
      Previous
    </button>
  );
}
