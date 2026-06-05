"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, Loader2, AlertCircle } from "lucide-react";

interface ApprovalState {
  status: "approved" | "needs_changes";
  comment: string;
  approvedBy: string;
  approvedAt: string;
}

interface ApprovalPanelProps {
  slug: string;
  skillId: string;
  skillName: string;
  existingApproval?: ApprovalState | null;
}

export function ApprovalPanel({
  slug,
  skillId,
  skillName,
  existingApproval,
}: ApprovalPanelProps) {
  const [state, setState] = useState<"idle" | "commenting" | "loading" | "done">(
    existingApproval ? "done" : "idle"
  );
  const [comment, setComment] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [result, setResult] = useState<ApprovalState | null>(existingApproval ?? null);
  const [error, setError] = useState("");

  async function submit(status: "approved" | "needs_changes") {
    if (status === "needs_changes" && !comment.trim()) {
      setError("Descreva o que precisa ser ajustado.");
      return;
    }
    setError("");
    setState("loading");

    try {
      const res = await fetch(`/api/clientes/${slug}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId,
          skillName,
          status,
          comment: comment.trim(),
          approvedBy: approvedBy.trim() || "Consultor",
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      const data = await res.json();
      setResult(data.approval);
      setState("done");
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
      setState(comment ? "commenting" : "idle");
    }
  }

  // ── Já aprovado ──────────────────────────────────────────────────────
  if (state === "done" && result) {
    const isApproved = result.status === "approved";
    const date = new Date(result.approvedAt).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });

    return (
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{
          background: isApproved ? "rgba(74,222,128,0.06)" : "rgba(250,204,21,0.06)",
          border: `1px solid ${isApproved ? "rgba(74,222,128,0.25)" : "rgba(250,204,21,0.25)"}`,
        }}
      >
        {isApproved
          ? <CheckCircle2 size={15} style={{ color: "#4ade80", marginTop: 1, flexShrink: 0 }} />
          : <MessageSquare size={15} style={{ color: "#facc15", marginTop: 1, flexShrink: 0 }} />
        }
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: isApproved ? "#4ade80" : "#facc15" }}>
            {isApproved ? "Aprovado" : "Ajustes solicitados"} por {result.approvedBy} · {date}
          </p>
          {result.comment && (
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
              "{result.comment}"
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Carregando ────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 size={14} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Salvando...</span>
      </div>
    );
  }

  // ── Formulário de comentário ──────────────────────────────────────────
  if (state === "commenting") {
    return (
      <div className="space-y-2">
        <input
          placeholder="Seu nome (opcional)"
          value={approvedBy}
          onChange={(e) => setApprovedBy(e.target.value)}
          className="w-full text-xs rounded-lg px-3 py-2 outline-none focus:ring-1"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        <textarea
          placeholder="O que precisa ser ajustado?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full text-xs rounded-lg px-3 py-2 resize-none outline-none focus:ring-1"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#facc15")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
        {error && (
          <p className="flex items-center gap-1 text-xs" style={{ color: "var(--color-primary)" }}>
            <AlertCircle size={12} /> {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => submit("needs_changes")}
            className="flex-1 text-xs font-bold py-2 rounded-lg transition-all"
            style={{
              background: "rgba(250,204,21,0.12)",
              color: "#facc15",
              border: "1px solid rgba(250,204,21,0.3)",
            }}
          >
            Enviar ajustes
          </button>
          <button
            onClick={() => { setState("idle"); setComment(""); setError(""); }}
            className="text-xs py-2 px-3 rounded-lg"
            style={{ color: "var(--color-text-muted)", background: "var(--color-surface-elevated)" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ── Estado idle ───────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {error && (
        <p className="flex items-center gap-1 text-xs" style={{ color: "var(--color-primary)" }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => submit("approved")}
          className="flex-1 text-xs font-bold py-2 rounded-lg transition-all"
          style={{
            background: "rgba(74,222,128,0.1)",
            color: "#4ade80",
            border: "1px solid rgba(74,222,128,0.3)",
          }}
        >
          ✅ Aprovar
        </button>
        <button
          onClick={() => setState("commenting")}
          className="flex-1 text-xs font-bold py-2 rounded-lg transition-all"
          style={{
            background: "rgba(250,204,21,0.08)",
            color: "#facc15",
            border: "1px solid rgba(250,204,21,0.2)",
          }}
        >
          💬 Solicitar ajustes
        </button>
      </div>
    </div>
  );
}
