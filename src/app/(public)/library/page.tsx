import { redirect } from "next/navigation";

/**
 * Legacy digital-download library route. InventSmith stores invention
 * deliverables inside each authenticated invention workspace, so old library
 * URLs are routed into the current product rather than showing retired
 * storefront/account copy.
 */
export default function LibraryPage() {
  redirect("/sign-in");
}
