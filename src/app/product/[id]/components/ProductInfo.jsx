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
    <div className="space-y-6 px-2 sm:px-4">
      <h1 className="text-2xl font-semibold">{title}</h1>

      <div className="flex gap-2 items-center">
        <p className="flex items-center">
          {rating.rate}
          <Star className="ml-1 h-4 w-4 text-orange-500" />
        </p>
        <p>({rating.count} reviews)</p>
      </div>

      <div className="border-t pt-5 space-y-3">
        <p className="text-3xl">${price.toFixed(2)}</p>
        <p className="text-lg">{description}</p>
        <p className="text-sm text-neutral-600">
          This value is fixed per unit and does not change when more quantity is
          added.
        </p>
      </div>

      <div className="grid grid-cols-2 border-t pt-5">
        <div className="space-y-1 font-semibold">
          <p>Category:</p>
          <p>Brand:</p>
          <p>Type:</p>
        </div>
        <div className="space-y-1">
          <p>{category}</p>
          <p>GustavoThemyus</p>
          <p>Object</p>
        </div>
      </div>
    </div>
  );
}
