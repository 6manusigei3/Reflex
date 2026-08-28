import AdminSetupForm from "@/components/auth/AdminSetupForm";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">
        <section className="hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.35),transparent_40%),#0f172a] p-10 text-white lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-black">R</div>
          <p className="mt-16 text-sm font-bold uppercase tracking-[0.18em] text-blue-400">Platform governance</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">Securely open your Reflex workspace.</h2>
          <p className="mt-5 text-sm leading-7 text-slate-400">The first administrator reviews accounts and keeps operational access separate from delivery dispatch.</p>
        </section>
        <section className="p-7 sm:p-10 lg:p-12"><AdminSetupForm /></section>
      </div>
    </main>
  );
}
