import { redirect } from "next/navigation";

/**
 * Legacy digital-storefront route retained only so old external/category URLs
 * resolve safely inside the current InventSmith product instead of exposing
 * the retired product-grid experience.
 */
export default function CategoryPage() {
  redirect("/journey");
}
