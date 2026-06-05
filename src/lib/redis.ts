import { Redis } from "@upstash/redis";

// Upstash Redis — configure as env vars no Vercel:
// UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface Approval {
  skillId: string;
  skillName: string;
  status: "approved" | "needs_changes";
  comment: string;
  approvedBy: string;
  approvedAt: string;
  clientSlug: string;
}

export function approvalKey(slug: string, skillId: string) {
  return `approval:${slug}:${skillId}`;
}

export function allApprovalsKey(slug: string) {
  return `approvals:${slug}`;
}
