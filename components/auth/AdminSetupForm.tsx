"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { apiRequest, getErrorMessage, saveSession, type ApiUser } from "@/lib/api";

const inputClass = "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function AdminSetupForm() {
  const router = useRouter();
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest<{ setupRequired: boolean }>("/auth/admin-setup", {}, false)
      .then((result) => setSetupRequired(result.setupRequired))
      .catch((error) => setMessage(getErrorMessage(error)));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmation) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<{ accessToken: string; user: ApiUser }>(
        "/auth/admin-setup",
        { method: "POST", body: JSON.stringify({ setupToken, name, email, password }) },
        false
      );
      saveSession({ accessToken: response.accessToken, user: response.user }, false);
      router.replace("/admin");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (setupRequired === false) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600">✓</div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">Admin setup is complete</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">The first Reflex administrator already exists. Sign in to manage the platform.</p>
        <Link href="/login" className="mt-7 flex h-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">Continue to sign in</Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">Secure first run</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Initialize Reflex Admin</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">This one-time setup closes automatically after the first administrator is created.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field label="Full name" id="setup-name"><input id="setup-name" required minLength={2} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></Field>
        <Field label="Email address" id="setup-email"><input id="setup-email" required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></Field>
        <Field label="Admin setup token" id="setup-token"><input id="setup-token" required type="password" autoComplete="off" value={setupToken} onChange={(event) => setSetupToken(event.target.value)} className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" id="setup-password"><input id="setup-password" required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></Field>
          <Field label="Confirm password" id="setup-confirmation"><input id="setup-confirmation" required type="password" minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={inputClass} /></Field>
        </div>
        {message && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}
        <button disabled={loading || setupRequired !== true} className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-60">{loading ? "Creating administrator…" : setupRequired === null ? "Checking setup…" : "Create Reflex Admin"}</button>
      </form>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>{children}</div>;
}
