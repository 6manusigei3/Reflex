import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dbeafe_0,transparent_36%),#f8fafc] px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <span aria-hidden="true">←</span>
          Back to login
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-black text-white shadow-lg shadow-blue-600/20">
            R
          </div>

          <p className="mt-6 text-sm font-semibold text-blue-600">
            Account recovery
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Forgot your password?
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Self-service password reset is not enabled for this Reflex
            workspace. Contact the workspace administrator to reset your
            account securely.
          </p>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Need access restored?
            </p>
            <p className="mt-1 text-sm leading-6 text-blue-700">
              Contact a Reflex administrator to verify your identity and
              restore access securely.
            </p>
          </div>

          <Link
            href="/login"
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            Return to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}
