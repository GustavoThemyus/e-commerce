"use server";

export async function createComment({ author, text }) {
  // aqui entra DB, Prisma, Supabase, etc
  console.log("New comment:", author, text);
}
