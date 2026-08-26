type RiderStatsProps = {
  assigned: number;
  active: number;
  completed: number;
};

export default function RiderStats({
  assigned,
  active,
  completed,
}: RiderStatsProps) {
  const stats = [
    {
      label: "Assigned",
      value: assigned,
      description: "waiting to start",
    },
    {
      label: "Active",
      value: active,
      description: "currently in progress",
    },
    {
      label: "Completed",
      value: completed,
      description: "finished deliveries",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {stat.value}
          </p>

          <p className="mt-1 hidden text-xs text-slate-500 sm:block">
            {stat.description}
          </p>
        </article>
      ))}
    </div>
  );
}
