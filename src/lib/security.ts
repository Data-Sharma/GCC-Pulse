import "server-only";
import { timingSafeEqual } from "node:crypto";

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isReviewer(request: Request) {
  const expected = process.env.GCC_PULSE_REVIEW_TOKEN;
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !received) return false;
  return secureEqual(expected, received);
}
