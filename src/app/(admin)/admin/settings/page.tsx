import { AdminHeader } from "@/components/admin";
import { MessageSquare } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Settings"
        description="Atlas branding and configuration"
      />

      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Managed by Your AI Co-Founder
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Atlas branding, colors, and content are configured through the AI
          co-founder chat. Ask your AI co-founder to update the store name,
          tagline, social links, or any other settings.
        </p>
      </div>
    </div>
  );
}
