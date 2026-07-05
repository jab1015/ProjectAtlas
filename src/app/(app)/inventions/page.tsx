"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { ReadinessBadge } from "@/components/atlas/readiness-badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { InventionCardMenu } from "@/components/atlas/invention-card-menu";

function formatRelativeDate(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function InventionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  const inventions = useQuery(
    api.journeyEngine.getUserInventions,
    isAuthenticated ? {} : "skip"
  );
  const canCreate = useQuery(
    api.authHelpers.getCanCreateInvention,
    isAuthenticated ? {} : "skip"
  );

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              My Inventions
            </h1>
            {canCreate && (
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/onboarding">
                  <Plus className="h-4 w-4" />
                  New Invention
                </Link>
              </Button>
            )}
          </div>

          {inventions === undefined ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : inventions.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-muted-foreground">No inventions yet.</p>
              <Button asChild>
                <Link href="/onboarding">Start your first invention</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {inventions.map((invention) => (
                <div
                  key={invention._id}
                  className="relative rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  {/* Clickable area — navigates to workspace */}
                  <Link
                    href={`/invention/${invention._id}`}
                    className="block p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-primary font-medium">
                            Stage {invention.currentStageId} — {invention.stageName}
                          </span>
                        </div>
                        <h2
                          className="text-lg font-semibold text-foreground truncate"
                          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                        >
                          {invention.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <ReadinessBadge state={invention.readinessState} />
                          <span className="text-xs text-muted-foreground">
                            Updated {formatRelativeDate(invention.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground shrink-0 mt-1 transition-colors" />
                    </div>
                  </Link>

                  {/* Context menu — positioned top-right, outside the <Link> */}
                  <div className="absolute top-3 right-10">
                    <InventionCardMenu
                      inventionId={invention._id}
                      inventionTitle={invention.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Explorer tier gate — show if can't create */}
          {canCreate === false && (
            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Explorer plan includes 1 active invention.{" "}
                <Link href="/pricing" className="text-foreground font-medium hover:underline underline-offset-4">
                  Upgrade to Inventor Pro
                </Link>{" "}
                for unlimited inventions.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}
