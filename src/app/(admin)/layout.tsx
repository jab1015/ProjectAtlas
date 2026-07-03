"use client";

import { AdminSidebar } from "@/components/admin";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar storeName="Atlas" />
      <main className="flex-1 overflow-y-auto p-6 pt-16 md:p-8 md:pt-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
