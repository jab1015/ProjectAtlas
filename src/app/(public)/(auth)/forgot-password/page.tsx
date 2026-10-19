"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtlasLogo } from "@/components/atlas/atlas-logo";

export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const formData = new FormData();
    formData.set("flow", "reset");
    formData.set("email", normalizedEmail);

    try {
      await signIn("password", formData);
      setEmail(normalizedEmail);
      setStep("verify");
    } catch {
      setError("We could not send a reset code. Check the email address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      setLoading(false);
      return;
    }

    formData.set("flow", "reset-verification");
    formData.set("email", email);
    formData.delete("confirmPassword");

    try {
      await signIn("password", formData);
      router.replace("/sign-in");
    } catch {
      setError("That reset code is invalid or expired. Request a new code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <Link href="/" className="no-underline hover:opacity-80 transition-opacity">
              <AtlasLogo size="md" className="text-primary" />
            </Link>
          </div>

          <div className="space-y-2 text-center">
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              {step === "request" ? "Reset your password" : "Enter your reset code"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "request"
                ? "Enter your InventSmith email and we’ll send you a one-time code."
                : `We sent a 6-digit code to ${email}.`}
            </p>
          </div>

          {step === "request" ? (
            <form onSubmit={requestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending code…" : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Reset code</Label>
                <Input
                  id="code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  minLength={6}
                  maxLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting password…" : "Set new password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  setError(null);
                  setStep("request");
                }}
              >
                Request a new code
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
