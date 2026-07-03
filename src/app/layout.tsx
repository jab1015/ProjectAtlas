import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { Providers } from "@/lib/convex";
import { PostHogProvider } from "@/lib/posthog";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Atlas — The Operating System for Inventors",
  description:
    "Atlas guides inventors from idea to market — through every stage of the invention journey. A structured path from first idea to launch and growth.",
  icons: process.env.NEXT_PUBLIC_BRAND_LOGO
    ? { icon: process.env.NEXT_PUBLIC_BRAND_LOGO }
    : { icon: "/icon.svg", shortcut: "/icon.svg" },
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
      <body
        className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} font-body antialiased`}
      >
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
