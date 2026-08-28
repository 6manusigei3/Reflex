"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  apiRequest,
  getErrorMessage,
  getSession,
  updateSessionUser,
  type ApiUser,
} from "@/lib/api";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export default function SettingsPanel({ fallbackName }: { fallbackName: string }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [name, setName] = useState(fallbackName);
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return (
      window.localStorage.getItem("reflex.preferences.deliveryNotifications") ??
      "true"
    ) === "true";
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await apiRequest<ApiUser>("/auth/me");
        if (!active) return;
        setUser(result);
        setName(result.name);
        setPhone(result.phone ?? "");
        setOrganization(result.organization ?? "");
      } catch (loadError) {
        if (!active) return;
        const sessionUser = getSession()?.user ?? null;
        if (sessionUser) {
          setUser(sessionUser);
          setName(sessionUser.name);
          setPhone(sessionUser.phone ?? "");
          setOrganization(sessionUser.organization ?? "");
        }
        setError(getErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();

    return () => {
      active = false;
    };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setProfileSaved(false);
    try {
      const updated = await apiRequest<ApiUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          phone: phone || null,
          organization: user.role === "retailer" ? organization : null,
        }),
      });
      setUser(updated);
      setName(updated.name);
      setPhone(updated.phone ?? "");
      setOrganization(updated.organization ?? "");
      updateSessionUser(updated);
      setProfileSaved(true);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  function savePreferences() {
    window.localStorage.setItem(
      "reflex.preferences.deliveryNotifications",
      String(notificationsEnabled)
    );
    setPreferencesSaved(true);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Profile Information</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Keep your contact details accurate across the Reflex workspace.
            </p>
          </div>
          {user && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">
              {user.role} account
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-8 space-y-4" aria-label="Loading profile">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : (
          <form onSubmit={saveProfile} className="mt-7 space-y-5">
            <label className="block text-sm font-bold text-slate-700">
              Full Name
              <input
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setProfileSaved(false);
                }}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Email
              <input
                readOnly
                value={user?.email ?? ""}
                className={inputClass}
                aria-describedby="email-help"
              />
              <span id="email-help" className="mt-2 block text-xs font-medium text-slate-500">
                Email changes are currently managed separately.
              </span>
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Phone Number {user?.role !== "rider" && <span className="font-medium text-slate-400">(optional)</span>}
              <input
                required={user?.role === "rider"}
                maxLength={30}
                type="tel"
                autoComplete="tel"
                placeholder="e.g. +254 712 345 678"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setProfileSaved(false);
                }}
                className={inputClass}
              />
            </label>

            {user?.role === "retailer" && (
              <label className="block text-sm font-bold text-slate-700">
                Business Name
                <input
                  required
                  maxLength={180}
                  autoComplete="organization"
                  value={organization}
                  onChange={(event) => {
                    setOrganization(event.target.value);
                    setProfileSaved(false);
                  }}
                  className={inputClass}
                />
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            {profileSaved && (
              <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Your profile changes have been saved.
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !user}
              className="h-12 w-full rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
            >
              {saving ? "Saving changes…" : "Save Changes"}
            </button>
          </form>
        )}
      </section>

      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-950">Preferences</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Control how operational updates appear in this workspace.
        </p>
        <label className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
          <span>
            <span className="block text-sm font-semibold text-slate-800">Delivery notifications</span>
            <span className="mt-1 block text-xs text-slate-500">Show assignment and status updates.</span>
          </span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(event) => {
              setNotificationsEnabled(event.target.checked);
              setPreferencesSaved(false);
            }}
            className="h-5 w-5 accent-blue-600"
          />
        </label>
        <button type="button" onClick={savePreferences} className="mt-5 h-11 w-full rounded-xl bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800">
          Save preferences
        </button>
        {preferencesSaved && (
          <p className="mt-3 text-center text-xs font-semibold text-emerald-600">Preferences saved on this device.</p>
        )}
      </section>
    </div>
  );
}
