import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";

export default function CheckoutCanceledPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-6 max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <span className="text-2xl">🙂</span>
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              No problem at all.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your invention is still here. Come back when you&rsquo;re ready.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
      <footer className="border-t border-border">
        <MadeThisBadge />
      </footer>
    </div>
  );
}
