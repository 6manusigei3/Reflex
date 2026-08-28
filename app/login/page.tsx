
import LoginForm from "@/components/auth/LoginForm";

function DeliveryIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M3 7h11v10H3V7ZM14 10h4l3 3v4h-7v-7Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="2" strokeWidth="1.8" />
      <circle cx="17" cy="18" r="2" strokeWidth="1.8" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M7 12a5 5 0 0 1 5-5M17 12a5 5 0 0 1-5 5"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function QRIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <rect x="3" y="3" width="6" height="6" strokeWidth="1.8" />
      <rect x="15" y="3" width="6" height="6" strokeWidth="1.8" />
      <rect x="3" y="15" width="6" height="6" strokeWidth="1.8" />
      <path
        d="M15 15h2v2h-2v-2ZM19 15h2v2M15 19h2v2M19 19h2v2"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const features = [
  {
    title: "Manage deliveries",
    description:
      "Create, assign and follow deliveries from one workspace.",
    icon: <DeliveryIcon />,
  },
  {
    title: "Live status visibility",
    description:
      "See delivery progress as riders update each stage.",
    icon: <LiveIcon />,
  },
  {
    title: "Delivery confirmation",
    description:
      "Support secure order confirmation using QR codes.",
    icon: <QRIcon />,
  },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
                R
              </div>

              <div>
                <p className="text-xl font-bold">
                  Reflex
                </p>

                <p className="text-xs text-slate-400">
                  Delivery Management
                </p>
              </div>
            </div>
          </div>

          <div className="relative max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-400">
              Smarter delivery coordination
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Know where every delivery stands.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
              Reflex brings retailers, dispatchers and riders into one
              connected delivery workflow with clear assignments,
              status visibility and confirmation.
            </p>

            <div className="mt-10 grid gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                    {feature.icon}
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {feature.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-slate-500">
            Reflex Delivery Management Platform
          </p>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:bg-white">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
