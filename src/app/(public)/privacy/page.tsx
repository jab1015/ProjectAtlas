export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <h1
        className="text-4xl font-bold tracking-tight text-foreground mb-6"
        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
      >
        Privacy Policy
      </h1>
      <div className="rounded-xl border border-border bg-muted/30 p-8">
        <p className="text-muted-foreground leading-relaxed">
          This page is being finalized and will be published before Atlas&rsquo;s
          public launch.
        </p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          In the meantime: your invention information is stored securely and is
          only accessible to you. Atlas does not share, sell, or distribute your
          invention details to any third party. Your invention remains your
          invention — always.
        </p>
      </div>
    </div>
  );
}
