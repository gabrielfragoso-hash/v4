import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STAGES } from "@/lib/workflow";
import { ProgressRing } from "@/components/ProgressRing";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
  Lock,
  Zap,
  MapPin,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const CLIENTES_DIR = "/Users/gabrielfragoso/clientes";

const STATUS_MAP: Record<string, "done" | "in_progress" | "pending" | "blocked"> = {
  completed: "done",
  in_progress: "in_progress",
  pending: "pending",
  blocked: "blocked",
};

const stageColors: Record<string, string> = {
  s0: "#64748b",
  s1: "#7c3aed",
  s2: "#2563eb",
  s3: "#059669",
  s4: "#ea580c",
  s5: "#e11d48",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "done":
      return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
    case "in_progress":
      return <Clock size={14} className="text-amber-500 shrink-0" />;
    case "blocked":
      return <Lock size={14} className="text-slate-300 shrink-0" />;
    default:
      return <Circle size={14} className="text-slate-300 shrink-0" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    done: { label: "Concluído", className: "bg-emerald-50 text-emerald-700" },
    in_progress: { label: "Em andamento", className: "bg-amber-50 text-amber-700" },
    pending: { label: "Pendente", className: "bg-slate-50 text-slate-500" },
    blocked: { label: "Bloqueada", className: "bg-slate-50 text-slate-400" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${s.className}`}>
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

  // Map client.json statuses to workflow statuses
  const statuses: Record<string, "done" | "in_progress" | "pending" | "blocked"> = {};
  for (const [id, val] of Object.entries(rawSkills)) {
    const raw = (val.status as string) ?? "pending";
    statuses[id] = STATUS_MAP[raw] ?? "pending";
  }

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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm truncate">{name}</span>
          <span className="ml-auto text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium shrink-0">
            Semana {currentWeek}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Client card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-start gap-5">
            {/* Ring */}
            <div className="relative flex items-center justify-center shrink-0">
              <ProgressRing pct={globalPct} size={72} />
              <span className="absolute text-base font-bold text-violet-700">{globalPct}%</span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-800 truncate">{name}</h1>
              <div className="flex flex-wrap gap-3 mt-1">
                {location !== "—" && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={11} /> {location.split("/")[0].trim()}
                  </span>
                )}
                {revenue !== "—" && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp size={11} /> {revenue}/mês
                  </span>
                )}
                {ticket !== "—" && (
                  <span className="text-xs text-slate-500">ticket {ticket}</span>
                )}
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span className="text-xs text-slate-600">{doneSkills} concluídas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-500" />
                  <span className="text-xs text-slate-600">{inProgress} em andamento</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle size={13} className="text-slate-300" />
                  <span className="text-xs text-slate-600">
                    {totalSkills - doneSkills - inProgress} restantes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage mini rings */}
          <div className="grid grid-cols-6 gap-2 mt-5">
            {STAGES.map((stage) => {
              const done = stage.skills.filter((s) => statuses[s.id] === "done").length;
              const total = stage.skills.length;
              const pct = total > 0 ? (done / total) * 100 : 0;
              return (
                <div key={stage.id} className="text-center">
                  <div className="relative flex items-center justify-center mx-auto w-9 h-9">
                    <ProgressRing pct={pct} size={36} stroke={4} color={stageColors[stage.id]} />
                    <span
                      className="absolute text-[9px] font-bold"
                      style={{ color: stageColors[stage.id] }}
                    >
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{stage.week}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last activity */}
        {lastHistory && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <Clock size={13} className="text-violet-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-violet-700">Última atividade</p>
              <p className="text-xs text-violet-600 mt-0.5 truncate">
                {lastHistory.skill as string} · {lastHistory.decision as string}
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
            const isActive = stage.skills.some(
              (s) => statuses[s.id] === "in_progress" || statuses[s.id] === "pending"
            );

            return (
              <div
                key={stage.id}
                className={`bg-white rounded-2xl border overflow-hidden ${
                  isActive && pct < 100 ? stage.border : "border-slate-200"
                }`}
              >
                {/* Stage header */}
                <div className={`px-4 py-3 flex items-center gap-3 ${pct > 0 && pct < 100 ? stage.bg : ""}`}>
                  <div className="relative w-7 h-7 shrink-0">
                    <ProgressRing pct={pct} size={28} stroke={3} color={stageColors[stage.id]} />
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
                      style={{ color: stageColors[stage.id] }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">{stage.week}</span>
                      <ChevronRight size={12} className="text-slate-300" />
                      <span className="text-sm font-semibold text-slate-800 truncate">{stage.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{stage.objective}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{done}/{total}</span>
                </div>

                {/* Skills */}
                <div className="divide-y divide-slate-50">
                  {stage.skills.map((skill) => {
                    const status = statuses[skill.id] ?? "pending";
                    const rawEntry = rawSkills[skill.id];
                    const version = rawEntry?.version as number | undefined;
                    const completedAt = rawEntry?.completed_at as string | undefined;

                    return (
                      <div
                        key={skill.id}
                        className={`px-4 py-2.5 flex items-center gap-3 ${
                          status === "done"
                            ? "opacity-70"
                            : status === "blocked"
                            ? "opacity-40"
                            : ""
                        }`}
                      >
                        <StatusIcon status={status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium truncate ${
                                status === "done" ? "text-slate-500 line-through decoration-1" : "text-slate-700"
                              }`}
                            >
                              {skill.name}
                            </span>
                            {version && (
                              <span className="text-[10px] text-slate-400">v{version}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{skill.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {completedAt && status === "done" && (
                            <span className="text-[10px] text-slate-400 hidden sm:block">{completedAt}</span>
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

        <p className="text-center text-xs text-slate-400 pb-4">
          {slug} · V4 Estruturação IA
        </p>
      </div>
    </main>
  );
}
