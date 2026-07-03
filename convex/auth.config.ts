// Required for @convex-dev/auth: tells the Convex deployment to trust the
// JWTs that the auth library itself issues (iss = this deployment's
// .convex.site URL, aud = "convex"). Without this file deployed, sign-up
// "succeeds" (an account and tokens are created) but every authenticated
// WebSocket connection is rejected, so isAuthenticated never becomes true
// and users bounce back to the sign-in page forever.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
