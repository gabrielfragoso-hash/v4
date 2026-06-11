import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStagesForClient } from "@/lib/workflow";
import { ProgressRing } from "@/components/ProgressRing";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  Lock,
  MapPin,
  TrendingUp,
  ChevronRight,
  FileText,
  ExternalLink,
  KeyRound,
} from "lucide-react";

const CLIENTES_DIR = process.env.CLIENTES_DIR ?? path.join(process.cwd(), "data/clientes");

const STATUS_MAP: Record<string, "done" | "in_progress" | "pending" | "blocked"> = {
  completed: "done",
  in_progress: "in_progress",
  pending: "pending",
  blocked: "blocked",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "done":
      return <CheckCircle2 size={13} style={{ color: "#4ade80", flexShrink: 0 }} />;
    case "in_progress":
      return <Clock size={13} style={{ color: "#facc15", flexShrink: 0 }} />;
    case "blocked":
      return <Lock size={13} style={{ color: "#3a3a3a", flexShrink: 0 }} />;
    default:
      return <Circle size={13} style={{ color: "#3a3a3a", flexShrink: 0 }} />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    done: { label: "Concluído", color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
    in_progress: { label: "Em andamento", color: "#facc15", bg: "rgba(250,204,21,0.1)" },
    pending: { label: "Pendente", color: "#4a4a4a", bg: "transparent" },
    blocked: { label: "Bloqueada", color: "#3a3a3a", bg: "transparent" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

// Load output summaries (just the summary field — lightweight)
async function loadOutputSummaries(slug: string): Promise<Record<string, string | null>> {
  const dir = path.join(CLIENTES_DIR, slug, "outputs");
  const summaries: Record<string, string | null> = {};
  try {
    const files = await fs.readdir(dir);
    await Promise.all(
      files.filter(f => f.endsWith(".json")).map(async (f) => {
        const skillId = f.replace(".json", "");
        try {
          const raw = await fs.readFile(path.join(dir, f), "utf-8");
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          summaries[skillId] = (parsed.summary as string) ?? null;
        } catch {
          summaries[skillId] = null;
        }
      })
    );
  } catch { /* no outputs dir */ }
  return summaries;
}

export default async function ClientePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let data: Record<string, unknown>;
  try {
    const raw = await fs.readFile(path.join(CLIENTES_DIR, slug, "client.json"), "utf-8");
    data = JSON.parse(raw);
  } catch {
    notFound();
  }

  const outputSummaries = await loadOutputSummaries(slug);
  const outputCount = Object.keys(outputSummaries).length;

  const b = (data.briefing as Record<string, unknown>) ?? {};
  const id = (b.identification as Record<string, unknown>) ?? {};
  const fin = (b.financials as Record<string, unknown>) ?? {};
  const progress = (data.progress as Record<string, unknown>) ?? {};
  const rawSkills = (progress.skills as Record<string, Record<string, unknown>>) ?? {};
  const history = (data.history as Array<Record<string, unknown>>) ?? [];
  const meta = (data.meta as Record<string, unknown>) ?? {};

  const statuses: Record<string, "done" | "in_progress" | "pending" | "blocked"> = {};
  for (const [skillId, val] of Object.entries(rawSkills)) {
    const raw = (val.status as string) ?? "pending";
    statuses[skillId] = STATUS_MAP[raw] ?? "pending";
  }

  const moduloVendas = meta.modulo_vendas === true;
  const STAGES = getStagesForClient(moduloVendas);

  const allSkills = STAGES.flatMap((s) => s.skills);
  const totalSkills = allSkills.length;
  const doneSkills = allSkills.filter((s) => statuses[s.id] === "done").length;
  const inProgress = allSkills.filter((s) => statuses[s.id] === "in_progress").length;
  const globalPct = Math.round((doneSkills / totalSkills) * 100);

  const name = (id.name as string) ?? slug;
  const location = (id.location as string) ?? (id.location_matrix as string)?.split("—")?.[1]?.trim() ?? null;
  const revenue = (fin.faturamento_medio_mensal as string) ?? null;
  const ticket = (id.ticket as string) ?? (fin.ticket_medio as string) ?? null;
  const currentWeek = (progress.current_week as number) ?? 1;
  const lastHistory = history[history.length - 1];
  const portalAccess = meta.portal_access as { user: string; password: string } | undefined;

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-10" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="w-6 h-6 flex items-center justify-center font-black text-[10px]" style={{ background: "var(--color-primary)", color: "#fff", clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }}>
            V4
          </div>
          <span className="font-bold text-sm truncate" style={{ color: "var(--color-text)" }}>{name}</span>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded shrink-0" style={{ background: "rgba(228,10,20,0.15)", color: "var(--color-primary)", border: "1px solid rgba(228,10,20,0.3)" }}>
            Semana {currentWeek}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* ── Overview card ── */}
        <div className="rounded-xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-start gap-5">
            <div className="relative flex items-center justify-center shrink-0">
              <ProgressRing pct={globalPct} size={72} stroke={5} />
              <span className="absolute text-base font-black" style={{ color: "var(--color-primary)" }}>{globalPct}%</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black truncate" style={{ color: "var(--color-text)" }}>{name}</h1>
              <div className="flex flex-wrap gap-3 mt-1">
                {location && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <MapPin size={11} /> {location.split("/")[0].split("—").pop()?.trim()}
                  </span>
                )}
                {revenue && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <TrendingUp size={11} /> {revenue}/mês
                  </span>
                )}
                {ticket && (
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>ticket {ticket}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <CheckCircle2 size={12} style={{ color: "#4ade80" }} />{doneSkills} concluídas
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <Clock size={12} style={{ color: "#facc15" }} />{inProgress} em andamento
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <Circle size={12} style={{ color: "#3a3a3a" }} />{totalSkills - doneSkills - inProgress} restantes
                </span>
                {outputCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#4ade80" }}>
                    <FileText size={12} />{outputCount} output{outputCount !== 1 ? "s" : ""} gerado{outputCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stage rings */}
          <div className="grid grid-cols-6 gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
            {STAGES.map((stage) => {
              const done = stage.skills.filter((s) => statuses[s.id] === "done").length;
              const total = stage.skills.length;
              const pct = total > 0 ? (done / total) * 100 : 0;
              const color = pct === 100 ? "#4ade80" : pct > 0 ? "#e40a14" : "#2a2a2a";
              const stageOutputs = stage.skills.filter(sk => outputSummaries[sk.id] !== undefined).length;
              return (
                <div key={stage.id} className="text-center">
                  <div className="relative flex items-center justify-center mx-auto w-9 h-9">
                    <ProgressRing pct={pct} size={36} stroke={3} color={color} />
                    <span className="absolute text-[8px] font-black" style={{ color }}>{Math.round(pct)}%</span>
                  </div>
                  <p className="text-[9px] mt-1 font-medium" style={{ color: "var(--color-text-muted)" }}>{stage.week}</p>
                  {stageOutputs > 0 && (
                    <p className="text-[8px] font-bold" style={{ color: "#4ade80" }}>{stageOutputs} doc{stageOutputs > 1 ? "s" : ""}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Portal link ── */}
        <Link
          href={`/clientes/${slug}/portal`}
          className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
          style={{ background: "rgba(228,10,20,0.08)", border: "1px solid rgba(228,10,20,0.25)" }}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>
              Portal do Cliente
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {outputCount > 0
                ? `${outputCount} entregável${outputCount !== 1 ? "is" : ""} disponíve${outputCount !== 1 ? "is" : "l"} para apresentar`
                : "Nenhum entregável gerado ainda"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {outputCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
                {outputCount} prontos
              </span>
            )}
            <ExternalLink size={14} style={{ color: "var(--color-primary)" }} />
          </div>
        </Link>

        {/* ── Portal credentials (interno — enviar ao cliente) ── */}
        {portalAccess && (
          <div className="rounded-xl px-4 py-3" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={12} style={{ color: "#facc15" }} />
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                Acesso do cliente ao portal
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-lg px-3 py-2" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "#4a4a4a" }}>URL</p>
                <p className="text-[11px] font-mono mt-0.5 truncate" style={{ color: "var(--color-text)" }}>/clientes/{slug}/portal</p>
              </div>
              <div className="rounded-lg px-3 py-2" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "#4a4a4a" }}>Usuário</p>
                <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--color-text)" }}>{portalAccess.user}</p>
              </div>
              <div className="rounded-lg px-3 py-2" style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)" }}>
                <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "#4a4a4a" }}>Senha</p>
                <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--color-text)" }}>{portalAccess.password}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Last activity ── */}
        {lastHistory && (
          <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: "rgba(228,10,20,0.07)", border: "1px solid rgba(228,10,20,0.2)" }}>
            <Clock size={12} style={{ color: "var(--color-primary)", marginTop: 2, flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>Última atividade</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--color-text)" }}>{lastHistory.skill as string}</span>
                {" · "}{lastHistory.decision as string}
              </p>
            </div>
          </div>
        )}

        {/* ── Stages ── */}
        <div className="space-y-3">
          {STAGES.map((stage) => {
            const done = stage.skills.filter((s) => statuses[s.id] === "done").length;
            const total = stage.skills.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isActive = pct > 0 && pct < 100;
            const isDone = pct === 100;
            const stageOutputCount = stage.skills.filter(sk => outputSummaries[sk.id] !== undefined).length;

            return (
              <div
                key={stage.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--color-surface)",
                  border: `1px solid ${isActive ? "rgba(228,10,20,0.25)" : "var(--color-border)"}`,
                  boxShadow: isActive ? "0 0 20px rgba(228,10,20,0.08)" : "none",
                }}
              >
                {/* Stage header */}
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: isActive ? "rgba(228,10,20,0.06)" : "transparent" }}>
                  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                    <ProgressRing pct={pct} size={32} stroke={3} color={isDone ? "#4ade80" : "#e40a14"} />
                    <span className="absolute text-[8px] font-black" style={{ color: isDone ? "#4ade80" : isActive ? "#e40a14" : "#3a3a3a" }}>{pct}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>{stage.week}</span>
                      <ChevronRight size={10} style={{ color: "var(--color-border)" }} />
                      <span className="text-sm font-bold truncate" style={{ color: "var(--color-text)" }}>{stage.title}</span>
                    </div>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--color-text-muted)" }}>{stage.objective}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {stageOutputCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80" }}>
                        <FileText size={9} />{stageOutputCount}
                      </span>
                    )}
                    <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>{done}/{total}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  {stage.skills.map((skill, i) => {
                    const status = statuses[skill.id] ?? "pending";
                    const rawEntry = rawSkills[skill.id];
                    const completedAt = rawEntry?.completed_at as string | undefined;
                    const isDoneSkill = status === "done";
                    const isBlockedSkill = status === "blocked";
                    const hasOutput = outputSummaries[skill.id] !== undefined;
                    const summary = outputSummaries[skill.id];

                    return (
                      <div
                        key={skill.id}
                        className="px-4 py-2.5"
                        style={{
                          borderTop: i === 0 ? "1px solid var(--color-border)" : "1px solid rgba(255,255,255,0.03)",
                          opacity: isBlockedSkill ? 0.35 : 1,
                          background: hasOutput ? "rgba(74,222,128,0.02)" : "transparent",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon status={status} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-sm font-semibold"
                                style={{
                                  color: isDoneSkill ? "var(--color-text-muted)" : "var(--color-text)",
                                  textDecoration: isDoneSkill ? "line-through" : "none",
                                  textDecorationColor: "#3a3a3a",
                                }}
                              >
                                {skill.name}
                              </span>
                              {hasOutput && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}>
                                  <FileText size={8} /> doc
                                </span>
                              )}
                            </div>
                            {!hasOutput && (
                              <p className="text-[11px] truncate" style={{ color: "#4a4a4a" }}>{skill.description}</p>
                            )}
                            {summary && (
                              <p className="text-[11px] mt-0.5 leading-relaxed line-clamp-2" style={{ color: "#6a6a6a" }}>{summary}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {completedAt && isDoneSkill && (
                              <span className="text-[10px] hidden sm:block" style={{ color: "#3a3a3a" }}>{completedAt}</span>
                            )}
                            <StatusBadge status={status} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Quick stats ── */}
        {outputCount > 0 && (
          <div className="rounded-xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "var(--color-text-muted)" }}>Outputs gerados</p>
            <div className="space-y-2">
              {Object.entries(outputSummaries).map(([skillId, summary]) => (
                <div key={skillId} className="flex items-start gap-2">
                  <FileText size={11} style={{ color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>{skillId}</p>
                    {summary && <p className="text-[11px] line-clamp-1" style={{ color: "var(--color-text-muted)" }}>{summary}</p>}
                  </div>
                </div>
              ))}
            </div>
            <Link href={`/clientes/${slug}/portal`} className="flex items-center gap-1.5 mt-3 pt-3 text-xs font-bold" style={{ color: "var(--color-primary)", borderTop: "1px solid var(--color-border)" }}>
              Ver portal do cliente <ExternalLink size={11} />
            </Link>
          </div>
        )}

        <p className="text-center text-[10px] pb-4 font-medium uppercase tracking-widest" style={{ color: "#2a2a2a" }}>
          {slug} · V4 Estruturação IA
        </p>
      </div>
    </main>
  );
}
