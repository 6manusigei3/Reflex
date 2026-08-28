"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { UserRole } from "./Sidebar";
import Topbar from "./Topbar";
import {
  ApiError,
  apiRequest,
  clearSession,
  getSession,
  type ApiUser,
} from "@/lib/api";
import { useDeliveryRealtime } from "@/lib/use-api-data";

type DashboardShellProps = {
  role: UserRole;
  userName: string;
  children: ReactNode;
};

function RealtimeBridge() {
  useDeliveryRealtime();
  return null;
}

export default function DashboardShell({
  role,
  userName,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState(userName);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function validateSession() {
      const session = getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const user = await apiRequest<ApiUser>("/auth/me");
        if (user.role !== role) {
          router.replace(`/${user.role}`);
          return;
        }
        if (active) {
          setDisplayName(user.name);
          setSessionReady(true);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          router.replace("/login");
        } else if (active) {
          if (session.user.role !== role) {
            router.replace(`/${session.user.role}`);
            return;
          }
          setDisplayName(session.user.name);
          setSessionReady(true);
        }
      }
    }

    void validateSession();
    return () => {
      active = false;
    };
  }, [role, router]);

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-blue-600 text-lg font-black shadow-lg shadow-blue-950/50">
            R
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-300">
            Securing your Reflex workspace…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.055),transparent_30%),#f8fafc] text-slate-950">
      <RealtimeBridge />
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <Topbar
          role={role}
          userName={displayName}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
