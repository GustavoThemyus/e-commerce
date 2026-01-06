"use client";
import CommentForm from "./CommentForm";
import { useEffect, useState } from "react";

// mock — depois trocar por DB
const MOCK_COMMENTS = [
  {
    id: 1,
    author: "F",
    text: "If you're reading this, there's someone who loves you so much.",
  },
  { id: 2, author: "G", text: "And this is for you." },
];

export default function CommentsSection() {
  const [comments, setComments] = useState(MOCK_COMMENTS);

  useEffect(() => {
    const localComments = JSON.parse(localStorage.getItem("comments")) || "[]";
    setComments([...MOCK_COMMENTS, ...localComments]);
  }, []);

  function handleNewComment(comment) {
    const updateLocal = JSON.parse(localStorage.getItem("comments") || "[]");

    const newComment = {
      ...comment,
      id: Date.now(),
    };

    const newLocalComments = [...updateLocal, newComment];

    localStorage.setItem("comments", JSON.stringify(newLocalComments));

    setComments([...MOCK_COMMENTS, ...newLocalComments]);
  }

  return (
    <section className="space-y-6 mt-8">
      <h2 className="text-2xl sm:text-3xl font-semibold">Comments</h2>

      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border p-4 rounded-md">
            <p className="font-medium">{comment.author}</p>
            <p className="text-neutral-600 text-sm sm:text-base">
              {comment.text}
            </p>
          </li>
        ))}
      </ul>

      <CommentForm onAddComment={handleNewComment} />
    </section>
  );
}
