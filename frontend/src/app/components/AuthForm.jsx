"use client";
import { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

// Formulário compartilhado pelas páginas de login e de cadastro
export default function AuthForm({ mode }) {
  const { login, register } = useContext(AuthContext);
  const router = useRouter();
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    try {
      await (isLogin ? login : register)(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-400 w-full sm:max-w-md rounded-lg p-4 sm:p-6 mx-auto mt-10 flex flex-col gap-4"
    >
      <h1 className="text-black font-semibold text-2xl">
        {isLogin ? "Log in" : "Create account"}
      </h1>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="border border-neutral-300 outline-0 rounded-lg px-3 py-2 focus:ring-1 focus:ring-neutral-200"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={isLogin ? undefined : 8}
          maxLength={72}
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="border border-neutral-300 outline-0 rounded-lg px-3 py-2 focus:ring-1 focus:ring-neutral-200"
          required
        />
        {!isLogin && (
          <span className="text-xs font-normal text-neutral-500">
            At least 8 characters.
          </span>
        )}
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className={`bg-emerald-500 text-white py-3 px-2 rounded-3xl transition ${
          isProcessing
            ? "opacity-50 cursor-not-allowed"
            : "hover:brightness-95 hover:cursor-pointer active:brightness-90"
        }`}
      >
        {isProcessing ? "Processing..." : isLogin ? "Log in" : "Sign up"}
      </button>

      <Link
        href={isLogin ? "/register" : "/login"}
        className="text-black hover:underline block w-fit mx-auto text-sm"
      >
        {isLogin ? "No account? Sign up" : "Already have an account? Log in"}
      </Link>
    </form>
  );
}
