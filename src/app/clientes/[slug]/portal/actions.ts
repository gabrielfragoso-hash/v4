"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getPortalAccess, createSessionToken, PORTAL_COOKIE } from "@/lib/portal-auth";

export async function loginPortal(
  slug: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const user = String(formData.get("user") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  const access = await getPortalAccess(slug);
  if (!access || user !== access.user.toLowerCase() || password !== access.password) {
    return { error: "Usuário ou senha incorretos. Confira os dados enviados pela equipe V4." };
  }

  const cookieStore = await cookies();
  cookieStore.set(PORTAL_COOKIE, createSessionToken(slug), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/clientes/${slug}/portal`,
    maxAge: 30 * 86400,
  });

  revalidatePath(`/clientes/${slug}/portal`);
  return null;
}

export async function logoutPortal(slug: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: PORTAL_COOKIE, path: `/clientes/${slug}/portal` });
  revalidatePath(`/clientes/${slug}/portal`);
}
