import { NextRequest, NextResponse } from "next/server";
import { redis, approvalKey, allApprovalsKey, type Approval } from "@/lib/redis";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: {
    skillId: string;
    skillName: string;
    status: "approved" | "needs_changes";
    comment: string;
    approvedBy: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { skillId, skillName, status, comment, approvedBy } = body;

  if (!skillId || !status) {
    return NextResponse.json({ error: "skillId e status são obrigatórios" }, { status: 400 });
  }

  const approval: Approval = {
    skillId,
    skillName,
    status,
    comment: comment ?? "",
    approvedBy: approvedBy ?? "Consultor",
    approvedAt: new Date().toISOString(),
    clientSlug: slug,
  };

  // Salva no Redis
  await redis.set(approvalKey(slug, skillId), approval);

  // Adiciona ao índice do cliente (lista de skills com aprovação)
  await redis.sadd(allApprovalsKey(slug), skillId);

  // Monta mensagem WhatsApp
  const statusEmoji = status === "approved" ? "✅" : "💬";
  const statusLabel = status === "approved" ? "APROVADO" : "COM AJUSTES";
  const clientName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const msg = [
    `${statusEmoji} *EE | ${clientName}*`,
    `Entregável: ${skillName}`,
    `Status: *${statusLabel}*`,
    comment ? `Comentário: "${comment}"` : "",
    `Por: ${approvedBy}`,
    ``,
    `Acesse: v4-liard-seven.vercel.app/clientes/${slug}/portal`,
  ]
    .filter(Boolean)
    .join("\n");

  await sendWhatsApp(msg);

  return NextResponse.json({ ok: true, approval });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const skillIds = await redis.smembers(allApprovalsKey(slug));

  if (!skillIds.length) {
    return NextResponse.json({ approvals: {} });
  }

  const approvals: Record<string, Approval> = {};

  await Promise.all(
    skillIds.map(async (id) => {
      const data = await redis.get<Approval>(approvalKey(slug, id));
      if (data) approvals[id] = data;
    })
  );

  return NextResponse.json({ approvals });
}
