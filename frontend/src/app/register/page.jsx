import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Sign up | E-Commerce",
  description: "Create an account",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
