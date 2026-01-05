"use client";
import { Star } from "lucide-react";

export default function ProductInfo({
  title,
  description,
  rating,
  category,
  price,
}) {
  return (
    <div className="pt-12 px-16">
      <h1 className="text-2xl">{title}</h1>

      <div className="flex gap-2 mt-2">
        <p className="text-md flex">
          {rating.rate}
          <Star className="ml-1 h-4 w-4 text-orange-500 mt-0.5" />
        </p>
        <p>({rating.count} reviews)</p>
      </div>

      <div className="border-t border-neutral-400 pt-5 mt-5">
        <div className="space-y-2">
          <p className="text-3xl">${price.toFixed(2)}</p>
          <p className="text-lg">{description}</p>
          <p className="text-sm">
            This value is fixed per unit and does not change when more quantity
            is added.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-neutral-400 pt-5 mt-5">
        <div className="space-y-1">
          <h2 className="text-md font-semibold">Category:</h2>
          <h2 className="text-md font-semibold">Brand:</h2>
          <h2 className="text-md font-semibold">Type:</h2>
        </div>
        <div className="space-y-1">
          <h2 className="text-md">{category}</h2>
          <h2 className="text-md">GustavoThemyus</h2>
          <h2 className="text-md">Object</h2>
        </div>
      </div>
    </div>
  );
}
