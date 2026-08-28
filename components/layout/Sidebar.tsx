"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/api";
import { useRealtimeStatus } from "@/lib/use-api-data";

export type UserRole = "admin" | "retailer" | "dispatcher" | "rider";

type SidebarProps = { role: UserRole; open: boolean; onClose: () => void };
type IconName = "dashboard" | "plus" | "package" | "history" | "bell" | "settings" | "users" | "requests";
type NavItem = { label: string; href: string; icon: IconName };

const roleNavigation: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "Overview", href: "/admin", icon: "dashboard" },
    { label: "Approvals", href: "/admin/approvals", icon: "requests" },
    { label: "Users", href: "/admin/users", icon: "users" },
    { label: "Deliveries", href: "/admin/deliveries", icon: "package" },
    { label: "Activity", href: "/admin/activity", icon: "history" },
    { label: "Notifications", href: "/admin/notifications", icon: "bell" },
  ],
  retailer: [
    { label: "Overview", href: "/retailer", icon: "dashboard" },
    { label: "New Delivery", href: "/retailer/new-delivery", icon: "plus" },
    { label: "My Deliveries", href: "/retailer/deliveries", icon: "package" },
    { label: "Delivery History", href: "/retailer/history", icon: "history" },
    { label: "Notifications", href: "/retailer/notifications", icon: "bell" },
  ],
  dispatcher: [
    { label: "Overview", href: "/dispatcher", icon: "dashboard" },
    { label: "Open Requests", href: "/dispatcher/requests", icon: "requests" },
    { label: "Deliveries", href: "/dispatcher/deliveries", icon: "package" },
    { label: "Riders", href: "/dispatcher/riders", icon: "users" },
    { label: "Delivery History", href: "/dispatcher/history", icon: "history" },
    { label: "Notifications", href: "/dispatcher/notifications", icon: "bell" },
  ],
  rider: [
    { label: "Overview", href: "/rider", icon: "dashboard" },
    { label: "My Deliveries", href: "/rider/deliveries", icon: "package" },
    { label: "Delivery History", href: "/rider/history", icon: "history" },
    { label: "Notifications", href: "/rider/notifications", icon: "bell" },
  ],
};

const iconPaths: Record<IconName | "logout", React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
  package: <><path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" strokeLinejoin="round" /><path d="m4 7 8 4 8-4M12 11v10" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeLinecap="round" /><path d="M3 3v5h5M12 7v5l3 2" strokeLinecap="round" /></>,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" strokeLinecap="round" strokeLinejoin="round" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.5 19.3a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.1 15a1.7 1.7 0 0 0-.6-1A1.7 1.7 0 0 0 2.4 13.6H2v-4h.4A1.7 1.7 0 0 0 4 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.4 4.1a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 9.8 2.4V2h4v.4A1.7 1.7 0 0 0 15 4a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.4a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.4v4h-.4A1.7 1.7 0 0 0 19.4 15Z" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  requests: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" /></>,
};

function Icon({ name }: { name: IconName | "logout" }) {
  return <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{iconPaths[name]}</svg>;
}

export default function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const { state: realtimeState } = useRealtimeStatus();
  const networkLabel =
    realtimeState === "connected"
      ? "Operations online"
      : realtimeState === "connecting" || realtimeState === "reconnecting"
        ? "Connecting operations"
        : "Operations offline";
  const networkDot =
    realtimeState === "connected"
      ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]"
      : realtimeState === "connecting" || realtimeState === "reconnecting"
        ? "animate-pulse bg-amber-400"
        : "bg-slate-500";

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <>
      {open && <button className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/5 bg-slate-950 text-slate-300 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-black text-white shadow-lg shadow-blue-950/40">R</div>
          <div><p className="text-lg font-bold tracking-tight text-white">Reflex</p><p className="text-xs text-slate-500">Delivery operations</p></div>
        </div>
        <div className="px-4 pt-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">{roleLabel} workspace</p>
          <nav className="mt-3 space-y-1">
            {roleNavigation[role].map((item) => {
              const active = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(`${item.href}/`));
              return <Link key={item.href} href={item.href} onClick={onClose} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}><Icon name={item.icon} />{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}</Link>;
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-white/10 p-4">
          <Link href={`/${role}/settings`} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"><Icon name="settings" /> Settings</Link>
          <button type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"><Icon name="logout" /> Sign out</button>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><span className={`h-2 w-2 rounded-full ${networkDot}`} /> {networkLabel}</div>
            <p className="mt-1 text-[11px] text-slate-600">Nairobi delivery network</p>
          </div>
        </div>
      </aside>
    </>
  );
}
