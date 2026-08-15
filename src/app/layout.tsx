import type { Metadata, Viewport } from "next";
import { Providers } from "@/lib/convex";
import { PostHogProvider } from "@/lib/posthog";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas — The Operating System for Inventors",
  description:
    "Atlas guides inventors from idea to market — through every stage of the invention journey. A structured path from first idea to launch and growth.",
  icons: process.env.NEXT_PUBLIC_BRAND_LOGO
    ? { icon: process.env.NEXT_PUBLIC_BRAND_LOGO }
    : { icon: "/icon.svg", shortcut: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2d6a4f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_GSC_VERIFICATION_TOKEN && (
        <head>
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GSC_VERIFICATION_TOKEN}
          />
        </head>
      )}
      <body className="font-body antialiased">
        <PostHogProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </PostHogProvider>
      </body>
    </html>
  );
}
