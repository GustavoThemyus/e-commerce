"use client";
import Image from "next/image";

export default function ProductImage({ image, title }) {
  console.log("🟢 ProductImage received:", { image, title });

  return (
    <div className="bg-white py-4 px-26">
      <Image
        src={image}
        alt={title}
        width={500}
        height={500}
        className="max-h-96 object-contain"
      />
    </div>
  );
}
