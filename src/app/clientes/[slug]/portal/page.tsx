import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getStagesForClient } from "@/lib/workflow";
import { verifySessionToken, PORTAL_COOKIE } from "@/lib/portal-auth";
import { LoginGate } from "./LoginGate";
import { logoutPortal } from "./actions";
import { CheckCircle2, Clock, Lock, Calendar, Mail, LogOut, Sparkles } from "lucide-react";

const CLIENTES_DIR = process.env.CLIENTES_DIR ?? path.join(process.cwd(), "data/clientes");

// ── Light premium theme (V4 brand) ──────────────────────────────────────────
const T = {
  bg: "#f5f5f6",
  surface: "#ffffff",
  border: "#e7e7ea",
  text: "#18181b",
  muted: "#5d5d63",
  subtle: "#9b9ba1",
  primary: "#e40a14",
  primarySoft: "rgba(228,10,20,0.06)",
  success: "#16a34a",
  successSoft: "rgba(22,163,74,0.08)",
  warning: "#b45309",
  dark: "#0c0c0d",
  cardShadow: "0 1px 2px rgba(16,16,20,0.04), 0 12px 32px rgba(16,16,20,0.06)",
};

// ── Load all outputs from disk ───────────────────────────────────────────────
async function loadOutputs(slug: string): Promise<Record<string, Record<string, unknown>>> {
  const dir = path.join(CLIENTES_DIR, slug, "outputs");
  const outputs: Record<string, Record<string, unknown>> = {};
  try {
    const files = await fs.readdir(dir);
    await Promise.all(
      files.filter(f => f.endsWith(".json")).map(async (f) => {
        try {
          const raw = await fs.readFile(path.join(dir, f), "utf-8");
          outputs[f.replace(".json", "")] = JSON.parse(raw);
        } catch { /* skip */ }
      })
    );
  } catch { /* no outputs dir */ }
  return outputs;
}

// ── Friendly skill names (client-facing) ────────────────────────────────────
const SKILL_LABELS: Record<string, string> = {
  "ee-s1-gc": "Reunião de Alinhamento",
  "ee-s1-kickoff": "Kickoff do Projeto",
  "ee-s2-diagnostico-branding": "Diagnóstico de Branding",
  "ee-s2-diagnostico-criativos": "Diagnóstico de Criativos",
  "ee-s2-benchmarking-criativos": "Benchmarking de Criativos",
  "ee-s2-diagnostico-social-media": "Diagnóstico de Social Media",
  "ee-s2-benchmarking-social-media": "Benchmarking de Social Media",
  "ee-s2-analise-site": "Análise do Site / Landing Page",
  "ee-s2-benchmarking-site": "Benchmarking do Site",
  "ee-s3-cliente-oculto": "Cliente Oculto",
  "ee-s3-estrutura-topologica": "Estrutura Comercial",
  "ee-s3-escopo-comercial": "Escopo Comercial",
  "ee-s3-jornada-cliente": "Jornada do Cliente",
  "ee-s3-metricas-comercial": "Métricas Comerciais",
  "ee-s3-stack-ferramentas": "Stack de Ferramentas",
  "ee-s4-analise-submercados": "Análise de Submercados",
  "ee-s4-tam-sam-som": "Dimensionamento de Mercado",
  "ee-s4-swot": "Análise SWOT",
  "ee-s4-comparacao-concorrentes": "Comparação com Concorrentes",
  "ee-s4-posicionamento-puv": "Posicionamento e PUV",
  "ee-s4-estrategias-aquisicao": "Estratégias de Aquisição",
  "ee-s4-estrategias-engajamento": "Estratégias de Engajamento",
  "ee-s4-estrategias-monetizacao": "Estratégias de Monetização",
  "ee-s4-estrategias-retencao": "Estratégias de Retenção",
  "ee-s4-drawflow": "Mapeamento do Funil",
  "ee-s4-diagnostico-midia-paga": "Diagnóstico de Mídia Paga",
  "ee-s5-identidade-visual": "Manual de Identidade Visual",
  "ee-s5-manual-copy": "Manual de Copy",
  "ee-s5-criativos": "Criativos (2 Estáticos + 1 Carrossel)",
  "ee-s5-landing-page": "Landing Page",
  "ee-s5-proximos-passos": "Próximos Passos",
  "ee-s5-feedback": "Coleta de Feedback",
  "ee-s5-proposta-comercial": "Proposta Comercial",
  // Legacy
  "ee-s1-diagnostico-maturidade": "Diagnóstico de Maturidade Digital",
  "ee-s1-persona-icp": "ICP & Persona",
  "ee-s1-swot": "Análise SWOT",
  "ee-s1-auditoria-comunicacao": "Auditoria de Comunicação",
  "ee-s2-diagnostico-comercial": "Diagnóstico Comercial",
};

// ── Generic output content renderer (light theme) ───────────────────────────
function renderOutputContent(output: Record<string, unknown>, skillId: string) {
  const items: { label: string; content: React.ReactNode }[] = [];

  const context = output.contexto_estrategico as string | undefined;
  if (context) {
    items.push({
      label: "Contexto estratégico",
      content: <p className="text-[13px] leading-relaxed" style={{ color: T.muted }}>{context}</p>,
    });
  }

  // Estratégias (array)
  const estrategias = output.estrategias as Array<{ rank?: number; nome?: string; descricao?: string; tipo?: string; problema_que_resolve?: string }> | undefined;
  if (Array.isArray(estrategias) && estrategias.length) {
    items.push({
      label: "Estratégias",
      content: (
        <div className="space-y-3">
          {estrategias.map((e, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
                style={{ background: T.primarySoft, color: T.primary }}
              >
                {e.rank ?? i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold" style={{ color: T.text }}>
                  {e.nome}
                  {e.tipo && (
                    <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded align-middle" style={{ background: "#f0f0f2", color: T.muted }}>
                      {e.tipo}
                    </span>
                  )}
                </p>
                {e.descricao && <p className="text-[13px] mt-1 leading-relaxed" style={{ color: T.muted }}>{e.descricao}</p>}
                {e.problema_que_resolve && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: T.warning }}>→ Resolve: {e.problema_que_resolve}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    });
  }

  // Gaps identificados
  const gaps = output.gaps_identificados as Array<{ titulo?: string; descricao?: string; impacto?: string } | string> | undefined;
  if (Array.isArray(gaps) && gaps.length) {
    items.push({
      label: `Pontos de melhoria identificados (${gaps.length})`,
      content: (
        <div className="space-y-2.5">
          {gaps.map((g, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: T.primary, marginTop: 7 }} />
              <div className="min-w-0">
                {typeof g === "string"
                  ? <p className="text-[13px] leading-relaxed" style={{ color: T.muted }}>{g}</p>
                  : <>
                    {g.titulo && <p className="text-[13px] font-bold" style={{ color: T.text }}>{g.titulo}</p>}
                    {g.descricao && <p className="text-[13px] leading-relaxed mt-0.5" style={{ color: T.muted }}>{g.descricao}</p>}
                    {g.impacto && <p className="text-xs mt-1 font-medium" style={{ color: T.primary }}>Impacto: {g.impacto}</p>}
                  </>
                }
              </div>
            </div>
          ))}
        </div>
      ),
    });
  }

  // Decisão (any field starting with "decisao")
  const decisionKey = Object.keys(output).find(k => k.startsWith("decisao"));
  if (decisionKey) {
    const dec = output[decisionKey] as Record<string, unknown> | string | undefined;
    if (dec) {
      const status = typeof dec === "object" ? (dec.status as string | undefined) : dec as string;
      const escopo = typeof dec === "object" ? (dec.escopo as string | undefined) : undefined;
      items.push({
        label: "Decisão tomada",
        content: (
          <div className="rounded-xl px-4 py-3" style={{ background: T.successSoft, border: `1px solid rgba(22,163,74,0.18)` }}>
            {status && <p className="text-[13px] font-bold" style={{ color: T.success }}>{status}</p>}
            {escopo && <p className="text-[13px] mt-1 leading-relaxed" style={{ color: T.muted }}>{escopo}</p>}
          </div>
        ),
      });
    }
  }

  // Próximos passos / sequência
  const proximos = (output.proximos_passos ?? output.sequencia_recomendada) as Record<string, string> | string[] | undefined;
  if (proximos && typeof proximos === "object") {
    const entries = Array.isArray(proximos) ? proximos.map((v, i) => [`${i + 1}`, v]) : Object.entries(proximos);
    if (entries.length) {
      items.push({
        label: "Próximas ações",
        content: (
          <div className="space-y-1.5">
            {entries.slice(0, 4).map(([k, v]) => (
              <div key={k} className="flex gap-2 text-[13px]" style={{ color: T.muted }}>
                <span className="font-bold" style={{ color: T.success }}>→</span>
                <span>{typeof v === "string" ? v : JSON.stringify(v)}</span>
              </div>
            ))}
          </div>
        ),
      });
    }
  }

  // KPIs / metas
  const kpis = output.kpis as Record<string, string> | undefined;
  if (kpis && typeof kpis === "object" && !Array.isArray(kpis)) {
    const kvEntries = Object.entries(kpis).slice(0, 4);
    if (kvEntries.length) {
      items.push({
        label: "Metas",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {kvEntries.map(([k, v]) => (
              <div key={k} className="rounded-xl px-3.5 py-3" style={{ background: "#fafafa", border: `1px solid ${T.border}` }}>
                <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: T.subtle }}>{k.replace(/_/g, " ")}</p>
                <p className="text-[13px] font-semibold mt-1" style={{ color: T.text }}>{v}</p>
              </div>
            ))}
          </div>
        ),
      });
    }
  }

  // Perfil atual (social media)
  const perfil = output.perfil_atual_do_canal as Record<string, string> | undefined;
  if (perfil && typeof perfil === "object") {
    items.push({
      label: "Perfil atual",
      content: (
        <div className="space-y-1.5">
          {Object.entries(perfil).slice(0, 4).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-[13px]">
              <span className="font-bold shrink-0 capitalize" style={{ color: T.subtle }}>{k.replace(/_/g, " ")}:</span>
              <span style={{ color: T.muted }}>{v}</span>
            </div>
          ))}
        </div>
      ),
    });
  }

  // Legacy: Maturidade scores
  if (skillId === "ee-s1-diagnostico-maturidade" && output.scores) {
    const scores = output.scores as Record<string, { score: number; classification: string }>;
    items.push({
      label: "Scores por pilar",
      content: (
        <div className="space-y-2.5">
          {(["midia_paga", "criativos", "cro", "crm", "seo"] as const).map(k => {
            const s = scores[k];
            if (!s) return null;
            const color = s.score >= 60 ? T.success : s.score >= 35 ? T.warning : T.primary;
            return (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: T.muted }}>{k.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span className="font-bold" style={{ color }}>{s.score}/100</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#ededef" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      ),
    });
  }

  // Legacy: SWOT quadrants
  if ((skillId === "ee-s1-swot" || skillId === "ee-s4-swot") && output.forcas) {
    const quadrants = [
      { key: "forcas", label: "Forças", color: T.success, bg: "rgba(22,163,74,0.06)" },
      { key: "fraquezas", label: "Fraquezas", color: T.primary, bg: "rgba(228,10,20,0.05)" },
      { key: "oportunidades", label: "Oportunidades", color: T.warning, bg: "rgba(180,83,9,0.06)" },
      { key: "ameacas", label: "Ameaças", color: "#52525b", bg: "#f4f4f5" },
    ];
    items.push({
      label: "Matriz SWOT",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quadrants.map(({ key, label, color, bg }) => {
            const arr = output[key] as Array<{ titulo: string }> | undefined;
            return (
              <div key={key} className="rounded-xl p-3.5" style={{ background: bg, border: `1px solid ${T.border}` }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
                <div className="space-y-1.5">
                  {(arr ?? []).slice(0, 3).map((item, i) => (
                    <p key={i} className="text-xs leading-snug" style={{ color: T.muted }}>· {item.titulo}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ),
    });
  }

  // Legacy: Persona
  if (skillId === "ee-s1-persona-icp" && output.persona) {
    const persona = output.persona as Record<string, string>;
    items.push({
      label: "Persona",
      content: (
        <div className="rounded-xl p-4" style={{ background: T.primarySoft, border: "1px solid rgba(228,10,20,0.12)" }}>
          <p className="text-sm font-black" style={{ color: T.text }}>{persona.nome}</p>
          {persona.frase_citacao && (
            <blockquote className="mt-2 pl-3 text-[13px] italic leading-relaxed" style={{ color: T.muted, borderLeft: `3px solid ${T.primary}` }}>
              &ldquo;{persona.frase_citacao}&rdquo;
            </blockquote>
          )}
        </div>
      ),
    });
  }

  return items;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let clientData: Record<string, unknown>;
  try {
    const raw = await fs.readFile(path.join(CLIENTES_DIR, slug, "client.json"), "utf-8");
    clientData = JSON.parse(raw);
  } catch {
    notFound();
  }

  const meta = (clientData.meta as Record<string, unknown>) ?? {};
  const b = (clientData.briefing as Record<string, unknown>) ?? {};
  const id = (b.identification as Record<string, unknown>) ?? {};
  const name = (id.name as string) ?? (meta.name as string) ?? slug;

  // ── Auth gate ──
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE)?.value;
  if (!verifySessionToken(token, slug)) {
    return <LoginGate slug={slug} clientName={name} />;
  }

  const outputs = await loadOutputs(slug);
  const progress = (clientData.progress as Record<string, unknown>) ?? {};
  const rawSkills = (progress.skills as Record<string, Record<string, unknown>>) ?? {};
  const moduloVendas = meta.modulo_vendas === true;
  const currentWeek = (progress.current_week as number) ?? 1;

  const stages = getStagesForClient(moduloVendas);

  const stageStatuses = stages.map(stage => {
    const total = stage.skills.length;
    const done = stage.skills.filter(s => rawSkills[s.id]?.status === "completed").length;
    if (done === total && total > 0) return "done" as const;
    if (done > 0) return "active" as const;
    return "pending" as const;
  });

  const doneCount = stageStatuses.filter(s => s === "done").length;
  const totalDeliverables = Object.keys(outputs).length;

  const startDate = (meta.created_at as string) ?? (b.objectives as Record<string, string>)?.v4_start;
  const daysIn = startDate ? Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000)) : null;

  const activeStageIdx = stageStatuses.findIndex(s => s === "active");
  const activeStage = activeStageIdx >= 0 ? stages[activeStageIdx] : stages[Math.min(doneCount, stages.length - 1)];

  return (
    <main className="min-h-screen" style={{ background: T.bg, color: T.text }}>
      {/* ── Dark brand header ── */}
      <header className="sticky top-0 z-20" style={{ background: "rgba(12,12,13,0.96)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center gap-3">
          <div
            className="w-7 h-7 flex items-center justify-center font-black text-[10px] shrink-0"
            style={{ background: T.primary, color: "#fff", clipPath: "polygon(10% 0%,100% 0%,90% 100%,0% 100%)" }}
          >
            V4
          </div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-bold leading-tight truncate">{name}</p>
            <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.45)" }}>Portal de acompanhamento</p>
          </div>
          <span
            className="ml-auto shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold"
            style={{ background: "rgba(228,10,20,0.18)", color: "#ff6b72", border: "1px solid rgba(228,10,20,0.3)" }}
          >
            Semana {currentWeek} de 5
          </span>
          <form action={logoutPortal.bind(null, slug)}>
            <button
              type="submit"
              title="Sair"
              className="shrink-0 p-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-10 space-y-10">

        {/* ── Hero ── */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: T.primary }}>
              Processo de Estruturação · 45 dias
            </p>
            <h1 className="text-[28px] font-black mt-1.5 leading-tight" style={{ color: T.text }}>
              Olá, {name.split(" ")[0]} 👋
            </h1>
            <p className="text-[15px] mt-2 leading-relaxed max-w-xl" style={{ color: T.muted }}>
              Este é o seu espaço para acompanhar tudo que estamos construindo juntos.
              Cada entregável aparece aqui assim que fica pronto.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: `${doneCount}/${stages.length}`, label: "Semanas concluídas", color: T.success },
              { value: String(totalDeliverables), label: "Entregáveis prontos", color: T.primary },
              { value: daysIn ? `Dia ${daysIn}` : "—", label: "Do projeto", color: T.warning },
            ].map(({ value, label, color }) => (
              <div
                key={label}
                className="rounded-2xl p-4 sm:p-5 text-center"
                style={{ background: T.surface, boxShadow: T.cardShadow }}
              >
                <p className="text-2xl sm:text-[28px] font-black" style={{ color }}>{value}</p>
                <p className="text-[10px] sm:text-[11px] mt-1 leading-tight font-medium" style={{ color: T.subtle }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Where we are now */}
          <div
            className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: "linear-gradient(135deg, #18181b 0%, #2a0508 100%)", boxShadow: T.cardShadow }}
          >
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(228,10,20,0.2)" }}>
              <Sparkles size={18} style={{ color: "#ff6b72" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.5)" }}>
                Onde estamos agora
              </p>
              <p className="text-white text-[15px] font-bold mt-0.5">
                {activeStage.clientWeek} — {activeStage.clientTitle}
              </p>
              <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                {activeStage.objective}
              </p>
            </div>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="rounded-2xl p-6" style={{ background: T.surface, boxShadow: T.cardShadow }}>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] mb-5" style={{ color: T.subtle }}>
            Jornada das 5 semanas
          </p>
          <div className="flex items-start overflow-x-auto pb-1 scrollbar-hide">
            {stages.map((stage, i) => {
              const status = stageStatuses[i];
              const isLast = i === stages.length - 1;
              return (
                <div key={stage.id} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center gap-2" style={{ width: 112 }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[12px]"
                      style={{
                        background: status === "done" ? T.success : status === "active" ? T.primary : "#ededef",
                        color: status === "pending" ? "#b0b0b6" : "#fff",
                        boxShadow: status === "active" ? "0 4px 16px rgba(228,10,20,0.35)" : "none",
                      }}
                    >
                      {status === "done" ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <p
                      className="text-[10px] font-bold text-center leading-tight px-1"
                      style={{ color: status === "done" ? T.success : status === "active" ? T.primary : T.subtle }}
                    >
                      {stage.clientTitle}
                    </p>
                    <p className="text-[9px] font-medium" style={{ color: "#c0c0c6" }}>{stage.clientWeek}</p>
                  </div>
                  {!isLast && (
                    <div
                      className="h-0.5 w-5 shrink-0 rounded-full"
                      style={{ background: stageStatuses[i] === "done" ? T.success : "#e4e4e7", marginBottom: 44 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex justify-between text-[11px] mb-1.5 font-medium" style={{ color: T.subtle }}>
              <span>Início</span>
              <span className="font-bold" style={{ color: T.primary }}>{Math.round((doneCount / stages.length) * 100)}% concluído</span>
              <span>45 dias</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#ededef" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(doneCount / stages.length) * 100}%`, background: `linear-gradient(90deg, ${T.primary}, #ff4d55)` }}
              />
            </div>
          </div>
        </div>

        {/* ── Stages + Deliverables ── */}
        {stages.map((stage, stageIdx) => {
          const status = stageStatuses[stageIdx];
          const stageOutputs = stage.skills.filter(sk => outputs[sk.id]);
          const stageCompleted = stage.skills.filter(sk => rawSkills[sk.id]?.status === "completed");

          // Future stage with nothing yet — locked preview
          if (status === "pending" && stageOutputs.length === 0) {
            return (
              <div
                key={stage.id}
                className="rounded-2xl p-5"
                style={{ background: "#fbfbfc", border: `1.5px dashed ${T.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f0f0f2" }}>
                    <Lock size={14} style={{ color: "#b0b0b6" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#b0b0b6" }}>{stage.clientWeek}</p>
                    <p className="text-sm font-bold" style={{ color: "#8a8a90" }}>{stage.clientTitle}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold" style={{ background: "#f0f0f2", color: "#9b9ba1" }}>
                    Em breve
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3.5 pl-12">
                  {stage.skills.slice(0, 5).map(sk => (
                    <span key={sk.id} className="text-[10px] px-2 py-1 rounded-lg font-medium" style={{ background: "#f4f4f5", color: "#a0a0a6" }}>
                      {SKILL_LABELS[sk.id] ?? sk.name}
                    </span>
                  ))}
                  {stage.skills.length > 5 && (
                    <span className="text-[10px] px-1 py-1 font-medium" style={{ color: "#b0b0b6" }}>+{stage.skills.length - 5} mais</span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <section key={stage.id} className="space-y-4">
              {/* Stage header */}
              <div className="flex items-center gap-3 pt-2">
                {status === "done"
                  ? <CheckCircle2 size={16} style={{ color: T.success, flexShrink: 0 }} />
                  : <Clock size={16} style={{ color: T.primary, flexShrink: 0 }} />}
                <h2 className="text-[15px] font-black" style={{ color: T.text }}>
                  {stage.clientWeek} — {stage.clientTitle}
                </h2>
                <span
                  className="ml-auto shrink-0 text-[10px] px-2.5 py-1 rounded-full font-bold"
                  style={{
                    background: status === "done" ? T.successSoft : T.primarySoft,
                    color: status === "done" ? T.success : T.primary,
                  }}
                >
                  {status === "done" ? "Concluída" : "Em andamento"}
                </span>
              </div>

              {/* Completed skills without output file — pills */}
              {stageCompleted.filter(sk => !outputs[sk.id]).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {stageCompleted.filter(sk => !outputs[sk.id]).map(sk => (
                    <span
                      key={sk.id}
                      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: T.successSoft, color: T.success }}
                    >
                      <CheckCircle2 size={10} /> {SKILL_LABELS[sk.id] ?? sk.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Output cards */}
              {stageOutputs.map((skill, idx) => {
                const output = outputs[skill.id];
                const summary = output.summary as string | undefined;
                const contentItems = renderOutputContent(output, skill.id);
                const label = SKILL_LABELS[skill.id] ?? skill.name;
                const num = String(idx + 1).padStart(2, "0");

                return (
                  <div key={skill.id} className="rounded-2xl overflow-hidden" style={{ background: T.surface, boxShadow: T.cardShadow }}>
                    {/* Card header */}
                    <div className="px-6 py-5" style={{ borderBottom: `1px solid ${T.border}` }}>
                      <div className="flex items-start gap-3.5">
                        <span
                          className="text-[11px] font-black shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: T.primarySoft, color: T.primary }}
                        >
                          {num}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-[15px] leading-snug" style={{ color: T.text }}>{label}</p>
                          {typeof output.generated_at === "string" && (
                            <p className="flex items-center gap-1.5 text-[11px] mt-1 font-medium" style={{ color: T.subtle }}>
                              <Calendar size={10} />
                              Entregue em {new Date(output.generated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                            </p>
                          )}
                        </div>
                        <span
                          className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: T.successSoft, color: T.success }}
                        >
                          <CheckCircle2 size={10} /> Pronto
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    {summary && (
                      <div className="px-6 py-5" style={{ background: "#fbfbfc", borderBottom: contentItems.length ? `1px solid ${T.border}` : "none" }}>
                        <p className="text-[13px] leading-relaxed" style={{ color: T.muted }}>{summary}</p>
                      </div>
                    )}

                    {/* Content sections */}
                    {contentItems.map(({ label: lbl, content }, ci) => (
                      <div key={lbl} className="px-6 py-5" style={{ borderTop: ci > 0 ? `1px solid ${T.border}` : "none" }}>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-3.5" style={{ color: T.subtle }}>{lbl}</p>
                        {content}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Active stage progress note */}
              {status === "active" && (
                <div
                  className="rounded-2xl px-5 py-4 flex items-center gap-3.5"
                  style={{ background: T.primarySoft, border: "1px solid rgba(228,10,20,0.12)" }}
                >
                  <Clock size={15} style={{ color: T.primary, flexShrink: 0 }} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold" style={{ color: T.primary }}>Nosso time está trabalhando nesta etapa</p>
                    <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                      {stageCompleted.length} de {stage.skills.length} entregáveis concluídos — os próximos aparecem aqui automaticamente.
                    </p>
                  </div>
                </div>
              )}
            </section>
          );
        })}

        {/* ── Contact card ── */}
        <div
          className="rounded-2xl p-6 sm:p-7"
          style={{ background: "linear-gradient(135deg, #0c0c0d 0%, #1c1c1f 60%, #2a0508 100%)", boxShadow: T.cardShadow }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.45)" }}>
                Dúvidas ou sugestões?
              </p>
              <p className="text-white text-lg font-black mt-1">Fale com seu estrategista</p>
              <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Estamos acompanhando seu projeto de perto. Qualquer ajuste que quiser nos entregáveis, é só chamar.
              </p>
            </div>
            <a
              href="mailto:gabriel.fragoso@v4company.com"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
              style={{ background: T.primary, boxShadow: "0 6px 20px rgba(228,10,20,0.4)" }}
            >
              <Mail size={15} /> Enviar mensagem
            </a>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="text-center space-y-2.5 pt-2 pb-6">
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-5 h-5 flex items-center justify-center font-black text-[8px]"
              style={{ background: T.primary, color: "#fff", clipPath: "polygon(10% 0%,100% 0%,90% 100%,0% 100%)" }}
            >
              V4
            </div>
            <span className="text-xs font-bold" style={{ color: T.muted }}>V4 Company</span>
          </div>
          <p className="text-[10px] font-medium" style={{ color: "#c0c0c6" }}>
            {name} · Processo de Estruturação · 45 dias
          </p>
        </div>

      </div>
    </main>
  );
}
