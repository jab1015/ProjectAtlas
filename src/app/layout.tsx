import type { Metadata, Viewport } from "next";
import { Providers } from "@/lib/convex";
import { PostHogProvider } from "@/lib/posthog";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "InventSmith — The Inventor OS",
  description:
    "InventSmith is The Inventor OS from Modern Methods. You invent. InventSmith does the work — from idea validation and research through product development, commercialization, launch, and growth.",
  icons: process.env.NEXT_PUBLIC_BRAND_LOGO
    ? { icon: process.env.NEXT_PUBLIC_BRAND_LOGO }
    : { icon: "/logo.PNG", shortcut: "/logo.PNG", apple: "/logo.PNG" },
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
