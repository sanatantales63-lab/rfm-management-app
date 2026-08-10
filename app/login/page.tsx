import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
