import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dbeafe_0,transparent_36%),#f8fafc] px-5 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">✓</div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-blue-600">Registration received</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Awaiting administrator approval</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">Your Reflex account has been created and is awaiting administrator approval. You can sign in as soon as an administrator activates it.</p>
        <Link href="/login" className="mt-8 flex h-12 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Return to sign in</Link>
      </section>
    </main>
  );
}
