"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AdminSidebar } from "@/components/admin";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensureUserProfile = useMutation(api.users.ensureUserProfile);
  const currentUser = useQuery(
    api.authHelpers.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setProfileReady(false);
      router.replace("/sign-in");
      return;
    }

    let cancelled = false;
    void ensureUserProfile()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setProfileReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ensureUserProfile, isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || !profileReady || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Checking administrator access…</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Administrator access required</h1>
          <p className="text-sm text-muted-foreground">
            This area is restricted to an authorized InventSmith administrator account.
          </p>
          <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/dashboard">
            Return to InventSmith
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar storeName="InventSmith" />
      <main className="flex-1 overflow-y-auto p-6 pt-16 md:p-8 md:pt-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
