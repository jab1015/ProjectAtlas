/**
 * MadeThis platform file host helper.
 *
 * Owner-uploaded files (logos, headshots, product photos) live on the
 * platform — NOT on this storefront's Convex deployment. Use this helper
 * when you only have a bare UUID. If you have a full URL from
 * list_business_files, USE IT VERBATIM — do not strip and rebuild.
 */

const FILES_BASE =
  process.env.NEXT_PUBLIC_PLATFORM_FILES_BASE ?? "https://www.madethis.com/files";

export function fileUrl(uuid: string): string {
  return `${FILES_BASE}/${uuid}`;
}
