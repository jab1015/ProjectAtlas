export interface FulfillmentPayload {
  orderId: string;
  productId: string;
  customerEmail: string;
  customerName?: string;
  amountCents: number;
  currency: string;
  stripeCheckoutSessionId?: string;
}

export function constantTimeEqualAscii(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

export function validateFulfillmentPayload(value: unknown): FulfillmentPayload | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const requiredStrings = ["orderId", "productId", "customerEmail", "currency"] as const;
  if (requiredStrings.some((key) => typeof body[key] !== "string" || !(body[key] as string).trim())) return null;
  if (typeof body.amountCents !== "number" || !Number.isSafeInteger(body.amountCents) || body.amountCents < 0) return null;
  if (!/^\S+@\S+\.\S+$/.test(body.customerEmail as string)) return null;
  if ((body.currency as string).length < 3 || (body.currency as string).length > 8) return null;
  if (body.customerName !== undefined && typeof body.customerName !== "string") return null;
  if (body.stripeCheckoutSessionId !== undefined && typeof body.stripeCheckoutSessionId !== "string") return null;
  return {
    orderId: (body.orderId as string).trim(),
    productId: (body.productId as string).trim(),
    customerEmail: (body.customerEmail as string).trim().toLowerCase(),
    customerName: typeof body.customerName === "string" ? body.customerName.trim() || undefined : undefined,
    amountCents: body.amountCents,
    currency: (body.currency as string).trim().toLowerCase(),
    stripeCheckoutSessionId: typeof body.stripeCheckoutSessionId === "string" ? body.stripeCheckoutSessionId.trim() || undefined : undefined,
  };
}
