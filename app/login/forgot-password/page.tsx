"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <span aria-hidden="true">←</span>
          Back to login
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            R
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Forgot your password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter the email address connected to your Reflex
            account. Password recovery will be connected to the
            backend authentication system.
          </p>

          {!sent ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6"
            >
              <label
                htmlFor="reset-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="reset-email"
                type="email"
                required
                placeholder="name@example.com"
                className="h-12 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

              <button
                type="submit"
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                Continue
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">
                Request received
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-700">
                The password reset process will be completed when
                backend authentication is connected.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
