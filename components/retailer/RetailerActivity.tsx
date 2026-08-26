type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
  type:
    | "created"
    | "assigned"
    | "transit"
    | "completed";
};

const activities: Activity[] = [
  {
    id: 1,
    title: "Delivery RFX-1008 is in transit",
    description:
      "David Mwangi started the delivery to Kilimani.",
    time: "6 min ago",
    type: "transit",
  },
  {
    id: 2,
    title: "Rider assigned",
    description:
      "Kevin Kiptoo was assigned to delivery RFX-1007.",
    time: "22 min ago",
    type: "assigned",
  },
  {
    id: 3,
    title: "New delivery created",
    description:
      "Delivery RFX-1006 was created for Mercy Achieng.",
    time: "1 hr ago",
    type: "created",
  },
  {
    id: 4,
    title: "Delivery completed",
    description:
      "RFX-1005 was successfully delivered and confirmed.",
    time: "3 hrs ago",
    type: "completed",
  },
];

const dotStyles: Record<Activity["type"], string> = {
  created: "bg-slate-400",
  assigned: "bg-blue-500",
  transit: "bg-amber-500",
  completed: "bg-emerald-500",
};

export default function RetailerActivity() {
  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          {index !== activities.length - 1 && (
            <span className="absolute left-[7px] top-5 h-[calc(100%-8px)] w-px bg-slate-200" />
          )}

          <span
            className={`relative mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-white ${dotStyles[activity.type]}`}
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {activity.title}
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {activity.description}
            </p>

            <p className="mt-2 text-xs font-medium text-slate-400">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
