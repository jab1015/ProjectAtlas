import { jwtVerify } from "jose";

export interface AdminPayload {
  businessId: string;
  userId: string;
  role: "admin";
}

export async function verifyAdminToken(
  token: string
): Promise<AdminPayload | null> {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    if (payload.role !== "admin") return null;
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}
