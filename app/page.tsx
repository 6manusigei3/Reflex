import DashboardShell from "@/components/layout/DashboardShell";

const stats = [
  {
    label: "Total Deliveries",
    value: "42",
  },
  {
    label: "Pending",
    value: "5",
  },
  {
    label: "In Transit",
    value: "8",
  },
  {
    label: "Completed",
    value: "29",
  },
];

export default function Home() {
  return (
    <DashboardShell
      role="retailer"
      userName="J. Kamau"
    >
      <section>
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">
            Retailer workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your deliveries and see what is happening at a glance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Frontend foundation ready
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            This temporary page confirms that the shared Reflex navigation,
            header, responsive layout and design system are working. The
            complete retailer dashboard will be added next.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}
