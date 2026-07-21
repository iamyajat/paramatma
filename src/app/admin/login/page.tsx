import { OmMark } from "@/components/icons/om-mark";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="text-center">
        <OmMark className="text-4xl text-gold" />
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
          Admin
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to manage content.</p>
      </div>
      <LoginForm />
    </div>
  );
}
