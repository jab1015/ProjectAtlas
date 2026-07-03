import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader
        storeName="Atlas"
      />
      <main className="flex-1">{children}</main>
      <StoreFooter
        storeName="Atlas"
        footerText="The operating system for inventors. A clear path from idea to market."
      />
    </div>
  );
}
