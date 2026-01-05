import CommentForm from "./CommentForm";

// mock — depois trocar por DB
async function getComments() {
  return [
    { id: 1, author: "John", text: "Great project!" },
    { id: 2, author: "Anna", text: "Clean UI and structure." },
  ];
}

export default async function CommentsSection() {
  const comments = await getComments();

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Comments</h2>

      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border p-4 rounded-md">
            <p className="font-medium">{comment.author}</p>
            <p className="text-neutral-600">{comment.text}</p>
          </li>
        ))}
      </ul>

      <CommentForm />
    </section>
  );
}
