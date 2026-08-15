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
        storeName="InventSmith"
      />
      <main className="flex-1">{children}</main>
      <StoreFooter
        storeName="InventSmith"
        footerText="The Inventor OS. You invent. InventSmith does the work. Published by Modern Methods."
      />
    </div>
  );
}
