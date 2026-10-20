// Required for @convex-dev/auth: tells the Convex deployment to trust the
// JWTs that the auth library itself issues (iss = this deployment's
// .convex.site URL, aud = "convex").
const convexSiteUrl =
  process.env.CONVEX_SITE_URL ??
  process.env.SITE_URL ??
  "https://agile-seahorse-379.convex.site";

export default {
  providers: [
    {
      domain: convexSiteUrl,
      applicationID: "convex",
    },
  ],
};
