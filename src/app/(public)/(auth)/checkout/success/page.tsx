"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { trackUpgradeCompleted } from "@/lib/analytics";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") ?? "Pro";

  useEffect(() => {
    trackUpgradeCompleted(plan);
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [plan, router]);

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>
      <div>
        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Welcome to {plan}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for upgrading. Your full inventor journey is now unlocked.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting to your dashboard in a moment…
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-md w-full">
          <Suspense
            fallback={
              <div className="text-center text-muted-foreground">Loading…</div>
            }
          >
            <SuccessContent />
          </Suspense>
        </div>
      </div>
      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}
