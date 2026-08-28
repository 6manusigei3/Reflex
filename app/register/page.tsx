import RegistrationForm from "@/components/auth/RegistrationForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">R</div>
            <div><p className="text-xl font-bold">Reflex</p><p className="text-xs text-slate-400">Delivery Management</p></div>
          </div>

          <div className="relative max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-400">Operational onboarding</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Start moving deliveries with confidence.</h2>
            <p className="mt-5 text-base leading-7 text-slate-400">Retailers create and track requests. Riders receive assignments and keep every delivery stage visible in real time.</p>
            <div className="mt-9 space-y-3">
              {["Secure role-based access", "Live delivery status updates", "Customer QR confirmation"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">✓</span>{item}</div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-slate-500">Reflex Delivery Management Platform</p>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:bg-white lg:py-12">
          <RegistrationForm />
        </section>
      </div>
    </main>
  );
}
