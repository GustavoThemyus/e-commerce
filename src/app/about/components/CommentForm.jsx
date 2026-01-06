"use client";

import { useState } from "react";
import { createComment } from "../actions";

export default function CommentForm() {
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await createComment({ author, text });
    setAuthor("");
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Your name"
        className="w-full border p-3 rounded-md text-sm sm:text-base"
        required
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your comment"
        className="w-full border p-3 rounded-md text-sm sm:text-base"
        required
      />
      <button className="w-full sm:w-auto px-4 py-2 border border-zinc-950 text-zinc-950 hover:bg-zinc-950 hover:text-white active:brightness-110 rounded-md transition-all cursor-pointer">
        Send comment
      </button>
    </form>
  );
}
