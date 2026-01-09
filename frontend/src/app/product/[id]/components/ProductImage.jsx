"use client";
import Image from "next/image";

export default function ProductImage({ image, title }) {
  return (
    <div className="p-4 sm:p-6 flex justify-center items-center rounded-lg">
      <Image
        src={image}
        alt={title}
        width={500}
        height={500}
        className="max-h-96 w-auto object-contain"
      />
    </div>
  );
}
