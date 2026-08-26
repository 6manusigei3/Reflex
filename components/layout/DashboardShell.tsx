"use client";

import { ReactNode, useState } from "react";
import Sidebar, { UserRole } from "./Sidebar";
import Topbar from "./Topbar";

type DashboardShellProps = {
  role: UserRole;
  userName: string;
  children: ReactNode;
};

export default function DashboardShell({
  role,
  userName,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <Topbar
          role={role}
          userName={userName}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
