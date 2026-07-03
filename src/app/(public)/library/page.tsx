import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

/**
 * Library page — legacy digital-downloads route.
 * Atlas does not use digital-download purchases; redirect to products.
 */
export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={BookOpen}
        title="Account Features Coming Soon"
        description="Download library and account management are not yet available. Use the download links from your purchase confirmation emails to access your files."
        ctaText="Browse Products"
        ctaLink="/products"
      />
    </div>
  );
}
