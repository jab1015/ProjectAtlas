import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { Password } from "@convex-dev/auth/providers/Password";

const PasswordResetEmail = Email({
  id: "inventsmith-password-reset",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15,
  async generateVerificationToken() {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return String(values[0] % 1_000_000).padStart(6, "0");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    if (!provider.apiKey) {
      throw new Error("AUTH_RESEND_KEY is not configured in the Convex deployment environment.");
    }

    const from = process.env.AUTH_EMAIL ?? "InventSmith <onboarding@resend.dev>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Reset your InventSmith password",
        text: `Your InventSmith password reset code is ${token}. This code expires in 15 minutes. If you did not request this, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>Reset your InventSmith password</h2><p>Use this code to reset your password:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${token}</p><p>This code expires in 15 minutes.</p><p>If you did not request this, you can ignore this email.</p></div>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend password reset email failed (${response.status}): ${detail}`);
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: PasswordResetEmail,
    }),
  ],
});
