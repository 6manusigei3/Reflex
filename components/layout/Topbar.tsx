import Link from "next/link";
import type { UserRole } from "./Sidebar";

type TopbarProps = {
  role: UserRole;
  userName: string;
  onMenuClick: () => void;
};

function BellIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Topbar({
  role,
  userName,
  onMenuClick,
}: TopbarProps) {
  const roleName =
    role.charAt(0).toUpperCase() + role.slice(1);

  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
        >
          <MenuIcon />
        </button>

        <div className="lg:hidden">
          <p className="font-bold text-slate-950">Reflex</p>
          <p className="text-xs text-slate-500">{roleName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/${role}/notifications`}
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <BellIcon />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </Link>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-4 text-slate-900">
              {userName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {roleName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
