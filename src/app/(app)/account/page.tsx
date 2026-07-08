"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  Gauge,
  Mail,
  UserRound,
} from "lucide-react";

import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TierKey = "free" | "inventor" | "pro" | "enterprise";

interface Plan {
  key: TierKey;
  name: string;
  price: string;
  activeInventions: number | null;
  aiTasksPerDay: number | null;
  creditsPerMonth: number | null;
  productId?: string;
  summary: string;
}

const PLATFORM_CHECKOUT_BASE = (
  process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://madethis.com"
).replace(/\/$/, "");

const SUPPORT_EMAIL = "support@madethis.com";

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Explorer",
    price: "Free",
    activeInventions: 1,
    aiTasksPerDay: null,
    creditsPerMonth: null,
    summary: "Your base plan for shaping the first invention.",
  },
  {
    key: "inventor",
    name: "Inventor",
    price: "$39/month",
    activeInventions: 3,
    aiTasksPerDay: 10,
    creditsPerMonth: 150,
    productId: "md7ck7xa3kyqxqwhy9a0ecb6t98a5cmx",
    summary: "More room to develop early invention paths.",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$79/month",
    activeInventions: 10,
    aiTasksPerDay: 25,
    creditsPerMonth: 400,
    productId: "md79k53vpy038wy2sgbd3e1k118a5m8f",
    summary: "For inventors actively moving several ideas forward.",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "$149/month",
    activeInventions: null,
    aiTasksPerDay: null,
    creditsPerMonth: null,
    productId: "md75s0c4nz902ngq0kngcn48zn8a40ea",
    summary: "Unlimited capacity for heavier invention pipelines.",
  },
];

const PLAN_RANK: Record<TierKey, number> = {
  free: 0,
  inventor: 1,
  pro: 2,
  enterprise: 3,
};

function getCheckoutUrl(productId: string) {
  return `${PLATFORM_CHECKOUT_BASE}/checkout/atlas/${productId}`;
}

function getDowngradeHref(planName: string) {
  const subject = encodeURIComponent(`Atlas plan downgrade to ${planName}`);
  const body = encodeURIComponent(
    `Hi Atlas team,\n\nPlease help me downgrade my Atlas subscription to ${planName}.\n\nThanks.`
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

function formatLimit(value: number | null, suffix: string) {
  return value === null ? "Unlimited" : `${value} ${suffix}`;
}

function getUsageLabel(activeCount: number, limit: number | null) {
  if (limit === null) return `${activeCount} active inventions used`;
  return `${activeCount} of ${limit} inventions used`;
}

function AccountSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="space-y-4">
        <div className="h-8 w-44 animate-pulse rounded-[var(--radius-md)] bg-muted" />
        <div className="h-5 w-72 animate-pulse rounded-[var(--radius-md)] bg-muted" />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-[var(--radius-lg)] bg-muted" />
        <div className="h-44 animate-pulse rounded-[var(--radius-lg)] bg-muted" />
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-[var(--radius-lg)] bg-muted" />
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  const profile = useQuery(
    api.users.getUserProfile,
    isAuthenticated ? {} : "skip"
  );

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <AccountSkeleton />
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-4 sm:px-6">
          <Card className="w-full p-6 text-center">
            <p className="text-sm text-muted-foreground">
              We could not load your account profile.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const currentPlan = PLANS.find((plan) => plan.key === profile.subscriptionTier) ?? PLANS[0];
  const usagePercent =
    currentPlan.activeInventions === null
      ? 100
      : Math.min(
          100,
          Math.round((profile.activeInventionCount / currentPlan.activeInventions) * 100)
        );

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              Account
            </p>
            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Profile and subscription
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review your Atlas profile, current plan, and available subscription options.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/inventions">View inventions</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-widest">
                  Profile
                </span>
              </div>
              <CardTitle className="text-xl">Inventor details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 text-base font-medium text-foreground">
                  {profile.name ?? "Name not set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 break-words text-base font-medium text-foreground">
                  {profile.email ?? "Email not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gauge className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-widest">
                  Current plan
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-xl">{currentPlan.name}</CardTitle>
                <Badge>{currentPlan.price}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">
                    {getUsageLabel(profile.activeInventionCount, currentPlan.activeInventions)}
                  </span>
                  <span className="text-muted-foreground">
                    {currentPlan.activeInventions === null ? "Unlimited" : `${usagePercent}%`}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-[var(--radius-md)] border border-border bg-muted/30 p-3">
                  <p className="text-muted-foreground">Inventions</p>
                  <p className="mt-1 font-medium text-foreground">
                    {formatLimit(currentPlan.activeInventions, "active")}
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-border bg-muted/30 p-3">
                  <p className="text-muted-foreground">AI tasks</p>
                  <p className="mt-1 font-medium text-foreground">
                    {formatLimit(currentPlan.aiTasksPerDay, "per day")}
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-border bg-muted/30 p-3">
                  <p className="text-muted-foreground">Credits</p>
                  <p className="mt-1 font-medium text-foreground">
                    {formatLimit(currentPlan.creditsPerMonth, "per month")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Plan options</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.key === currentPlan.key;
              const isUpgrade = PLAN_RANK[plan.key] > PLAN_RANK[currentPlan.key];
              const isDowngrade = PLAN_RANK[plan.key] < PLAN_RANK[currentPlan.key];

              return (
                <Card
                  key={plan.key}
                  className={cn(
                    "flex flex-col transition-colors",
                    isCurrent && "border-primary bg-accent/40"
                  )}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex min-h-6 items-center justify-between gap-3">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {isCurrent && <Badge>Current Plan</Badge>}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{plan.price}</p>
                      <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                        {plan.summary}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-5">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span className="text-foreground">
                          {formatLimit(plan.activeInventions, "active inventions")}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span className="text-foreground">
                          {formatLimit(plan.aiTasksPerDay, "AI tasks/day")}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span className="text-foreground">
                          {formatLimit(plan.creditsPerMonth, "credits/month")}
                        </span>
                      </li>
                    </ul>

                    <div className="mt-auto pt-2">
                      {isCurrent ? (
                        <p className="rounded-[var(--radius-md)] bg-muted px-3 py-2 text-center text-sm font-medium text-muted-foreground">
                          Active on your account
                        </p>
                      ) : isUpgrade && plan.productId ? (
                        <Button asChild className="w-full">
                          <a href={getCheckoutUrl(plan.productId)}>
                            Upgrade
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : isDowngrade ? (
                        <Button asChild variant="outline" className="w-full">
                          <a href={getDowngradeHref(plan.name)}>
                            Downgrade
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <p className="rounded-[var(--radius-md)] bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
                          Free base plan
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}
