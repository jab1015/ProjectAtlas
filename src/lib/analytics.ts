/**
 * Atlas Analytics — provider-agnostic event layer.
 *
 * Purpose: Product learning. Track where inventors succeed, get stuck, or
 * abandon the journey. No analytics UI is exposed in the MVP.
 *
 * Implementation: Thin wrapper over PostHog (already wired in posthog.tsx).
 * Swap the provider by changing the `emit` function — all call sites stay
 * the same.
 *
 * Events are intentionally generic (verb_noun snake_case) so they work with
 * any downstream analytics platform.
 */

import posthog from "posthog-js";

type EventProperties = Record<string, string | number | boolean | null | undefined>;

function emit(event: string, properties?: EventProperties) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(event, {
      $groups: { business: process.env.NEXT_PUBLIC_BUSINESS_ID },
      ...properties,
    });
  } catch {
    // Never block product flows on analytics failures
  }
}

// ── Landing ───────────────────────────────────────────────────────────────────

export function trackLandingPageViewed() {
  emit("landing_page_viewed");
}

export function trackGetStartedClicked() {
  emit("get_started_clicked");
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export function trackAccountCreated(method: "password" | "google" | "apple") {
  emit("account_created", { method });
}

export function trackSignedIn(method: "password" | "google" | "apple") {
  emit("signed_in", { method });
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export function trackOnboardingStarted() {
  emit("onboarding_started");
}

export function trackOnboardingCompleted() {
  emit("onboarding_completed");
}

// ── Invention ────────────────────────────────────────────────────────────────

export function trackInventionCreated(inventionId: string) {
  emit("invention_created", { inventionId });
}

// ── Journey ──────────────────────────────────────────────────────────────────

export function trackStageCompleted(stageId: number, stageName: string, inventionId: string) {
  emit("stage_completed", { stageId, stageName, inventionId });
}

export function trackContinueClicked(stageId: number, stageName: string, inventionId: string) {
  emit("continue_clicked", { stageId, stageName, inventionId });
}

// ── Upgrade ──────────────────────────────────────────────────────────────────

export function trackUpgradePromptShown(context: string) {
  emit("upgrade_prompt_shown", { context });
}

export function trackUpgradeStarted(plan: string) {
  emit("upgrade_started", { plan });
}

export function trackUpgradeCompleted(plan: string) {
  emit("upgrade_completed", { plan });
}
