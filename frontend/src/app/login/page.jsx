import AuthForm from "../components/AuthForm";

export const metadata = {
  title: "Log in | E-Commerce",
  description: "Log in to your account",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
