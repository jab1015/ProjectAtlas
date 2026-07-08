"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { LogOut, ScrollText, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { useEffect } from "react";

interface AppNavProps {
  className?: string;
}

export function AppNav({ className }: AppNavProps) {
  const { signOut } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.authHelpers.getCurrentUser);

  // Ensure user profile (role + tier) is set on every authenticated load.
  // This is the seeding mechanism for admin role.
  const ensureProfile = useMutation(api.users.ensureUserProfile);
  useEffect(() => {
    if (isAuthenticated) {
      ensureProfile().catch(() => {
        // Non-blocking — profile will be set on next load if this fails
      });
    }
  }, [isAuthenticated, ensureProfile]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className ?? ""}`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Wordmark + mark */}
        <Link href="/dashboard" className="no-underline hover:opacity-80 transition-opacity">
          <AtlasLogo size="sm" className="text-primary" />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Admin badge */}
          {user?.role === "admin" && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
              Administrator
            </span>
          )}

          {/* My Inventions */}
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/inventions">
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">My Inventions</span>
            </Link>
          </Button>

          {/* Account */}
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href="/account">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          </Button>

          {/* User display */}
          {user && (
            <span className="hidden md:block text-sm text-muted-foreground truncate max-w-[140px]">
              {user.name ?? user.email ?? ""}
            </span>
          )}

          {/* Sign out */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
