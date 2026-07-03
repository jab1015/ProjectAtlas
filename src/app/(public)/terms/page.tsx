export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <h1
        className="text-4xl font-bold tracking-tight text-foreground mb-6"
        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
      >
        Terms of Service
      </h1>
      <div className="rounded-xl border border-border bg-muted/30 p-8">
        <p className="text-muted-foreground leading-relaxed">
          This page is being finalized and will be published before Atlas&rsquo;s
          public launch.
        </p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          In the meantime: Atlas makes no claim of ownership over anything you
          create, share, or develop using the platform. Your invention is yours.
        </p>
      </div>
    </div>
  );
}
