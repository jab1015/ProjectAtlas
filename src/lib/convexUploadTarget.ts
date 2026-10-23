const productionConvexOrigins = [
  "https://agile-seahorse-379.convex.cloud",
  "https://agile-seahorse-379.convex.site",
];

function configuredOrigins() {
  const configured = [
    process.env.NEXT_PUBLIC_CONVEX_URL,
    process.env.CONVEX_CLOUD_URL,
    process.env.CONVEX_SITE_URL,
    ...productionConvexOrigins,
  ];

  return configured.flatMap((value) => {
    if (!value?.trim()) return [];
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") return [];
      return [url.origin];
    } catch {
      return [];
    }
  });
}

export function isAllowedConvexUploadTarget(target: URL) {
  return configuredOrigins().includes(target.origin);
}
