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
} from "lucide-react";

const CLIENTES_DIR = process.env.CLIENTES_DIR ?? path.join(process.cwd(), "data/clientes");

const STATUS_MAP: Record<string, "done" | "in_progress" | "pending" | "blocked"> = {
  completed: "done",
  in_progress: "in_progress",
  pending: "pending",
  blocked: "blocked",
};

// Stage accent colors — all use V4 red family with muted variants
const stageAccent: Record<string, { color: string; bg: string; border: string }> = {
  s0: { color: "#e40a14", bg: "rgba(228,10,20,0.06)", border: "rgba(228,10,20,0.25)" },
  s1: { color: "#e40a14", bg: "rgba(228,10,20,0.06)", border: "rgba(228,10,20,0.25)" },
  s2: { color: "#e40a14", bg: "rgba(228,10,20,0.06)", border: "rgba(228,10,20,0.25)" },
  s3: { color: "#e40a14", bg: "rgba(228,10,20,0.06)", border: "rgba(228,10,20,0.25)" },
  s4: { color: "#e40a14", bg: "rgba(228,10,20,0.06)", border: "rgba(228,10,20,0.25)" },
  s5: { color: "#e40a14", bg: "rgba(228,10,20,0.06)", border: "rgba(228,10,20,0.25)" },
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
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

export default async function ClientePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: Record<string, unknown>;
  try {
    const raw = await fs.readFile(path.join(CLIENTES_DIR, slug, "client.json"), "utf-8");
    data = JSON.parse(raw);
  } catch {
    notFound();
  }

  const b = (data.briefing as Record<string, unknown>) ?? {};
  const id = (b.identification as Record<string, unknown>) ?? {};
  const fin = (b.financials as Record<string, unknown>) ?? {};
  const progress = (data.progress as Record<string, unknown>) ?? {};
  const rawSkills = (progress.skills as Record<string, Record<string, unknown>>) ?? {};
  const history = (data.history as Array<Record<string, unknown>>) ?? [];

  const statuses: Record<string, "done" | "in_progress" | "pending" | "blocked"> = {};
  for (const [skillId, val] of Object.entries(rawSkills)) {
    const raw = (val.status as string) ?? "pending";
    statuses[skillId] = STATUS_MAP[raw] ?? "pending";
  }

  const moduloVendas = (data.meta as Record<string, unknown>)?.modulo_vendas === true;
  const STAGES = getStagesForClient(moduloVendas);

  const allSkills = STAGES.flatMap((s) => s.skills);
  const totalSkills = allSkills.length;
  const doneSkills = allSkills.filter((s) => statuses[s.id] === "done").length;
  const inProgress = allSkills.filter((s) => statuses[s.id] === "in_progress").length;
  const globalPct = Math.round((doneSkills / totalSkills) * 100);

  const name = (id.name as string) ?? slug;
  const location = (id.location_matrix as string)?.split("—")?.[1]?.trim() ?? "—";
  const revenue = (fin.faturamento_medio_mensal as string) ?? "—";
  const ticket = (fin.ticket_medio as string) ?? "—";
  const currentWeek = (progress.current_week as number) ?? 1;
  const lastHistory = history[history.length - 1];

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="transition-colors" style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft size={16} />
          </Link>
          <div
            className="w-6 h-6 flex items-center justify-center font-black text-[10px]"
            style={{
              background: "var(--color-primary)",
              color: "#fff",
              clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
            }}
          >
            V4
          </div>
          <span className="font-bold text-sm truncate" style={{ color: "var(--color-text)" }}>
            {name}
          </span>
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
            style={{
              background: "rgba(228,10,20,0.15)",
              color: "var(--color-primary)",
              border: "1px solid rgba(228,10,20,0.3)",
            }}
          >
            Semana {currentWeek}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Client overview card */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-start gap-5">
            <div className="relative flex items-center justify-center shrink-0">
              <ProgressRing pct={globalPct} size={72} stroke={5} />
              <span
                className="absolute text-base font-black"
                style={{ color: "var(--color-primary)" }}
              >
                {globalPct}%
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black truncate" style={{ color: "var(--color-text)" }}>
                {name}
              </h1>
              <div className="flex flex-wrap gap-3 mt-1">
                {location !== "—" && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <MapPin size={11} /> {location.split("/")[0].trim()}
                  </span>
                )}
                {revenue !== "—" && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    <TrendingUp size={11} /> {revenue}/mês
                  </span>
                )}
                {ticket !== "—" && (
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    ticket {ticket}
                  </span>
                )}
              </div>
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <CheckCircle2 size={12} style={{ color: "#4ade80" }} />
                  {doneSkills} concluídas
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <Clock size={12} style={{ color: "#facc15" }} />
                  {inProgress} em andamento
                </span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  <Circle size={12} style={{ color: "#3a3a3a" }} />
                  {totalSkills - doneSkills - inProgress} restantes
                </span>
              </div>
            </div>
          </div>

          {/* Stage rings */}
          <div
            className="grid grid-cols-6 gap-2 mt-5 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            {STAGES.map((stage) => {
              const done = stage.skills.filter((s) => statuses[s.id] === "done").length;
              const total = stage.skills.length;
              const pct = total > 0 ? (done / total) * 100 : 0;
              const color = pct === 100 ? "#4ade80" : pct > 0 ? "#e40a14" : "#2a2a2a";
              return (
                <div key={stage.id} className="text-center">
                  <div className="relative flex items-center justify-center mx-auto w-9 h-9">
                    <ProgressRing pct={pct} size={36} stroke={3} color={color} />
                    <span
                      className="absolute text-[8px] font-black"
                      style={{ color }}
                    >
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <p className="text-[9px] mt-1 font-medium" style={{ color: "var(--color-text-muted)" }}>
                    {stage.week}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portal link */}
        <Link
          href={`/clientes/${slug}/portal`}
          className="flex items-center justify-between rounded-xl px-4 py-3 transition-all group"
          style={{
            background: "rgba(228,10,20,0.08)",
            border: "1px solid rgba(228,10,20,0.25)",
          }}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>
              Portal do Cliente
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              Entregáveis da Semana 1 prontos para apresentar
            </p>
          </div>
          <ChevronRight size={16} style={{ color: "var(--color-primary)" }} />
        </Link>

        {/* Last activity */}
        {lastHistory && (
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-2"
            style={{
              background: "rgba(228,10,20,0.07)",
              border: "1px solid rgba(228,10,20,0.2)",
            }}
          >
            <Clock size={12} style={{ color: "var(--color-primary)", marginTop: 2, flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>
                Última atividade
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                  {lastHistory.skill as string}
                </span>{" "}
                · {lastHistory.decision as string}
              </p>
            </div>
          </div>
        )}

        {/* Stages */}
        <div className="space-y-3">
          {STAGES.map((stage) => {
            const done = stage.skills.filter((s) => statuses[s.id] === "done").length;
            const total = stage.skills.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const accent = stageAccent[stage.id];
            const isActive = pct > 0 && pct < 100;
            const isDone = pct === 100;

            return (
              <div
                key={stage.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--color-surface)",
                  border: `1px solid ${isActive ? accent.border : "var(--color-border)"}`,
                  boxShadow: isActive ? "0 0 20px rgba(228,10,20,0.08)" : "none",
                }}
              >
                {/* Stage header */}
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ background: isActive ? accent.bg : "transparent" }}
                >
                  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                    <ProgressRing
                      pct={pct}
                      size={32}
                      stroke={3}
                      color={isDone ? "#4ade80" : "#e40a14"}
                    />
                    <span
                      className="absolute text-[8px] font-black"
                      style={{ color: isDone ? "#4ade80" : isActive ? "#e40a14" : "#3a3a3a" }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                        {stage.week}
                      </span>
                      <ChevronRight size={10} style={{ color: "var(--color-border)" }} />
                      <span className="text-sm font-bold truncate" style={{ color: "var(--color-text)" }}>
                        {stage.title}
                      </span>
                    </div>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {stage.objective}
                    </p>
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: "var(--color-text-muted)" }}>
                    {done}/{total}
                  </span>
                </div>

                {/* Skills */}
                <div>
                  {stage.skills.map((skill, i) => {
                    const status = statuses[skill.id] ?? "pending";
                    const rawEntry = rawSkills[skill.id];
                    const version = rawEntry?.version as number | undefined;
                    const completedAt = rawEntry?.completed_at as string | undefined;
                    const isDoneSkill = status === "done";
                    const isBlockedSkill = status === "blocked";

                    return (
                      <div
                        key={skill.id}
                        className="px-4 py-2.5 flex items-center gap-3"
                        style={{
                          borderTop: i === 0 ? "1px solid var(--color-border)" : "1px solid rgba(255,255,255,0.03)",
                          opacity: isBlockedSkill ? 0.35 : 1,
                        }}
                      >
                        <StatusIcon status={status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-semibold truncate"
                              style={{
                                color: isDoneSkill ? "var(--color-text-muted)" : "var(--color-text)",
                                textDecoration: isDoneSkill ? "line-through" : "none",
                                textDecorationColor: "#3a3a3a",
                              }}
                            >
                              {skill.name}
                            </span>
                            {version && (
                              <span className="text-[10px]" style={{ color: "#3a3a3a" }}>
                                v{version}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] truncate" style={{ color: "#4a4a4a" }}>
                            {skill.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {completedAt && isDoneSkill && (
                            <span className="text-[10px] hidden sm:block" style={{ color: "#3a3a3a" }}>
                              {completedAt}
                            </span>
                          )}
                          <StatusBadge status={status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] pb-4 font-medium uppercase tracking-widest"
          style={{ color: "#2a2a2a" }}>
          {slug} · V4 Estruturação IA
        </p>
      </div>
    </main>
  );
}
