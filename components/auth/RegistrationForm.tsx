"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  apiRequest,
  getErrorMessage,
  type ApiUser,
  type UserRole,
} from "@/lib/api";

type RegistrationRole = Extract<UserRole, "retailer" | "dispatcher" | "rider">;

export default function RegistrationForm() {
  const router = useRouter();
  const [role, setRole] = useState<RegistrationRole>("retailer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmation) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<{
        user: ApiUser;
        message: string;
      }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            role,
            organization: role === "retailer" ? organization : null,
            phone: role === "rider" || role === "retailer" ? phone || null : null,
          }),
        },
        false
      );

      router.replace(`/pending?email=${encodeURIComponent(response.user.email)}`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[520px]">
      <div className="mb-7 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">R</div>
          <div><p className="text-xl font-bold text-slate-950">Reflex</p><p className="text-xs text-slate-500">Delivery Management</p></div>
        </div>
      </div>

      <p className="text-sm font-semibold text-blue-600">Join the network</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Create your Reflex account</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">Choose how you work in Reflex, then complete your account details.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-700">Account type</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["retailer", "dispatcher", "rider"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                aria-pressed={role === option}
                className={`rounded-xl border p-4 text-left transition ${role === option ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <span className="block text-sm font-bold capitalize text-slate-950">{option}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{option === "retailer" ? "Create and track deliveries" : option === "dispatcher" ? "Coordinate delivery operations" : "Receive and complete assignments"}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="register-name">
            <input id="register-name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={inputClass} />
          </Field>
          <Field label="Email address" htmlFor="register-email">
            <input id="register-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={inputClass} />
          </Field>
        </div>

        {role === "retailer" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" htmlFor="register-organization">
              <input id="register-organization" required value={organization} onChange={(event) => setOrganization(event.target.value)} autoComplete="organization" className={inputClass} />
            </Field>
            <Field label="Phone number (optional)" htmlFor="register-phone">
              <input id="register-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" className={inputClass} />
            </Field>
          </div>
        )}
        {role === "rider" && (
          <Field label="Phone number" htmlFor="register-phone">
            <input id="register-phone" required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" className={inputClass} />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="register-password">
            <input id="register-password" required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className={inputClass} />
          </Field>
          <Field label="Confirm password" htmlFor="register-confirmation">
            <input id="register-confirmation" required type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" className={inputClass} />
          </Field>
        </div>

        <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">All new accounts are reviewed by a Reflex administrator before workspace access is enabled. Admin access is never available through public registration.</p>

        <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-70">
          {loading ? "Creating account…" : `Create ${role} account`}
        </button>

        {message && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">Sign in</Link></p>
    </div>
  );
}

const inputClass = "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>{children}</div>;
}
