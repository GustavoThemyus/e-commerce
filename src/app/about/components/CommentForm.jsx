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
        className="w-full border p-2 rounded-md"
        required
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your comment"
        className="w-full border p-2 rounded-md"
        required
      />
      <button className="px-4 py-2 bg-black text-white rounded-md">
        Send comment
      </button>
    </form>
  );
}
