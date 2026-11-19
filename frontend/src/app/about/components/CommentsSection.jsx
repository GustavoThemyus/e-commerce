"use client";
import CommentForm from "./CommentForm";
import { useEffect, useState } from "react";
import { parseStoredComments } from "@/lib/comments.mjs";

// mock — depois trocar por DB
const MOCK_COMMENTS = [
  {
    id: 1,
    author: "Guima",
    text: "Testing the comments section.",
  },
  {
    id: 2,
    author: "Xanglus",
    text: "It works sucessfully!",
  },
];

// localStorage pode estar bloqueado (navegação privada, política do navegador): nesse caso o
// comentário só vive na memória, e a página continua funcionando
function readLocalComments() {
  try {
    return parseStoredComments(localStorage.getItem("comments"));
  } catch {
    return [];
  }
}

export default function CommentsSection() {
  const [comments, setComments] = useState(MOCK_COMMENTS);

  useEffect(() => {
    setComments([...MOCK_COMMENTS, ...readLocalComments()]);
  }, []);

  function handleNewComment(comment) {
    const updateLocal = readLocalComments();

    const newComment = {
      ...comment,
      id: Date.now(),
    };

    const newLocalComments = [...updateLocal, newComment];

    try {
      localStorage.setItem("comments", JSON.stringify(newLocalComments));
    } catch {
      // sem armazenamento: o comentário aparece nesta visita e não é guardado
    }

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
