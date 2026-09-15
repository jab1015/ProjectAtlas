// Required for @convex-dev/auth: tells the Convex deployment to trust the
// JWTs that the auth library itself issues (iss = this deployment's
// .convex.site URL, aud = "convex"). MadeThis's managed environment currently
// exposes SITE_URL while standard Convex environments may expose
// CONVEX_SITE_URL, so preserve both without changing or duplicating secrets.
// Without this provider deployed, sign-up can appear to succeed while every
// authenticated WebSocket connection is rejected.
const convexSiteUrl = process.env.CONVEX_SITE_URL ?? process.env.SITE_URL;

export default {
  providers: [
    {
      domain: convexSiteUrl,
      applicationID: "convex",
    },
  ],
};
