import Link from "next/link";
import { cn } from "@/lib/utils";
import { AtlasLogo } from "@/components/atlas/atlas-logo";

interface StoreFooterProps {
  storeName?: string;
  footerText?: string;
  className?: string;
}

export function StoreFooter({
  storeName = "Atlas",
  footerText = "The operating system for inventors. A clear path from idea to market.",
  className,
}: StoreFooterProps) {
  return (
    <footer className={cn("border-t border-border bg-background", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Left — wordmark + tagline */}
          <div>
            <AtlasLogo size="sm" className="text-foreground" />
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {footerText}
            </p>
          </div>

          {/* Middle — product links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Explore
            </p>
            <ul className="space-y-3">
              {[
                { label: "Journey", href: "/journey" },
                { label: "About", href: "/about" },
                { label: "Pricing", href: "/pricing" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — legal + contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Legal
            </p>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="mailto:team@atlas.madethis.app"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 Atlas. All rights reserved.
          </p>
          <div className="opacity-50 text-xs">
            <a
              href="https://madethis.com/r/dfy6c9ej"
              target="_blank"
              rel="noopener noreferrer"
              className="text-current no-underline inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Built with MadeThis
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
