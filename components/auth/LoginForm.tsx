"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  apiRequest,
  getErrorMessage,
  saveSession,
  type ApiUser,
} from "@/lib/api";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="m3 3 18 18"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 5.2A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7a15 15 0 0 1-2.7 3.6M6.3 6.3C3.9 8 2.5 12 2.5 12s3.5 7 9.5 7a9.5 9.5 0 0 0 4-.8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        strokeWidth="1.8"
      />
      <path
        d="m4 7 8 6 8-6"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        strokeWidth="1.8"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await apiRequest<{
        accessToken: string;
        user: ApiUser;
      }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        false
      );

      saveSession(
        { accessToken: response.accessToken, user: response.user },
        remember
      );
      router.replace(`/${response.user.role}`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-8 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            R
          </div>

          <div>
            <p className="text-xl font-bold text-slate-950">
              Reflex
            </p>
            <p className="text-xs text-slate-500">
              Delivery Management
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-blue-600">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Sign in to Reflex
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter your account details to access your delivery workspace.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email address
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <MailIcon />
            </div>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <LockIcon />
            </div>

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
          />

          <span className="text-sm text-slate-600">
            Remember me
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {message && (
          <div
            role="status"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {message}
          </div>
        )}
      </form>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-center text-sm text-slate-500">
          New to Reflex?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-600 transition hover:text-blue-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
