import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const CLIENTES_DIR = process.env.CLIENTES_DIR ?? path.join(process.cwd(), "data/clientes");
const SECRET = process.env.PORTAL_SECRET ?? "v4-estruturacao-portal-2026";
const SESSION_DAYS = 30;

export const PORTAL_COOKIE = "v4_portal";

export interface PortalAccess {
  user: string;
  password: string;
  created_at?: string;
}

export async function getPortalAccess(slug: string): Promise<PortalAccess | null> {
  try {
    const raw = await fs.readFile(path.join(CLIENTES_DIR, slug, "client.json"), "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    const meta = (data.meta as Record<string, unknown>) ?? {};
    const access = meta.portal_access as PortalAccess | undefined;
    return access?.user && access?.password ? access : null;
  } catch {
    return null;
  }
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/** Cria o valor do cookie de sessão: slug.expiry.hmac */
export function createSessionToken(slug: string): string {
  const exp = Date.now() + SESSION_DAYS * 86400000;
  const payload = `${slug}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** Valida o token e retorna true se a sessão vale para este slug */
export function verifySessionToken(token: string | undefined, slug: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenSlug, expStr, mac] = parts;
  if (tokenSlug !== slug) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = sign(`${tokenSlug}.${expStr}`);
  try {
    return crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
  } catch {
    return false;
  }
}
