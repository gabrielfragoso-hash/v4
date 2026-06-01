import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Zap, Target, Users, BarChart3, MessageSquare, Search, Smartphone } from "lucide-react";

const CLIENTES_DIR = process.env.CLIENTES_DIR ?? path.join(process.cwd(), "data/clientes");

async function readOutput(slug: string, name: string) {
  try {
    const raw = await fs.readFile(path.join(CLIENTES_DIR, slug, "outputs", `${name}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Sub-components (server-safe, no state) ──────────────────────────────────

function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4 scroll-mt-20">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
        <span className="text-[10px] font-black uppercase tracking-widest px-3"
          style={{ color: "var(--color-primary)" }}>
          {label}
        </span>
        <div className="h-px flex-1" style={{ background: "var(--color-border)" }} />
      </div>
      {children}
    </section>
  );
}

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={{
      background: "var(--color-surface)",
      border: `1px solid ${accent ? "rgba(228,10,20,0.35)" : "var(--color-border)"}`,
      boxShadow: accent ? "0 0 24px rgba(228,10,20,0.08)" : "none",
    }}>
      {children}
    </div>
  );
}

function ScoreBar({ label, score, benchmark, max = 100 }: { label: string; score: number; benchmark?: number; max?: number }) {
  const pct = (score / max) * 100;
  const color = score >= 60 ? "#4ade80" : score >= 35 ? "#facc15" : "#e40a14";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>{label}</span>
        <div className="flex items-center gap-2">
          {benchmark !== undefined && (
            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>setor {benchmark}</span>
          )}
          <span className="text-sm font-black" style={{ color }}>{score}/100</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
        <div className="h-full rounded-full transition-all" style={{
          width: `${pct}%`,
          background: color,
          boxShadow: `0 0 8px ${color}88`,
        }} />
        {benchmark !== undefined && (
          <div className="absolute top-0 h-full w-0.5" style={{
            left: `${(benchmark / max) * 100}%`,
            background: "rgba(255,255,255,0.3)",
          }} />
        )}
      </div>
    </div>
  );
}

function Tag({ children, type = "neutral" }: { children: React.ReactNode; type?: "positive" | "negative" | "neutral" | "opportunity" }) {
  const styles = {
    positive: { bg: "rgba(74,222,128,0.1)", color: "#4ade80", border: "rgba(74,222,128,0.2)" },
    negative: { bg: "rgba(228,10,20,0.1)", color: "#e40a14", border: "rgba(228,10,20,0.2)" },
    opportunity: { bg: "rgba(250,204,21,0.1)", color: "#facc15", border: "rgba(250,204,21,0.2)" },
    neutral: { bg: "var(--color-surface-elevated)", color: "var(--color-text-muted)", border: "var(--color-border)" },
  };
  const s = styles[type];
  return (
    <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {children}
    </span>
  );
}

function QuadrantCard({ title, icon, items, type }: {
  title: string;
  icon: React.ReactNode;
  items: { titulo: string; descricao?: string; implicacao?: string; risco?: string; como_capturar?: string; protecao?: string }[];
  type: "positive" | "negative" | "opportunity" | "neutral";
}) {
  const colors = {
    positive: { accent: "#4ade80", bg: "rgba(74,222,128,0.04)" },
    negative: { accent: "#e40a14", bg: "rgba(228,10,20,0.04)" },
    opportunity: { accent: "#facc15", bg: "rgba(250,204,21,0.04)" },
    neutral: { accent: "#a0a0a0", bg: "rgba(160,160,160,0.04)" },
  };
  const c = colors[type];
  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: c.bg,
      border: `1px solid ${c.accent}33`,
    }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${c.accent}22` }}>
        <span style={{ color: c.accent }}>{icon}</span>
        <span className="text-sm font-black uppercase tracking-wide" style={{ color: c.accent }}>{title}</span>
        <span className="ml-auto text-xs font-bold" style={{ color: c.accent }}>{items.length}</span>
      </div>
      <div className="divide-y" style={{ borderColor: `${c.accent}15` }}>
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 space-y-1">
            <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-text)" }}>{item.titulo}</p>
            {(item.descricao) && (
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{item.descricao}</p>
            )}
            {(item.implicacao || item.risco || item.como_capturar || item.protecao) && (
              <p className="text-[11px] leading-relaxed" style={{ color: c.accent }}>
                → {item.implicacao ?? item.risco ?? item.como_capturar ?? item.protecao}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const canalIcon: Record<string, React.ReactNode> = {
  "Site / Landing Page": <Smartphone size={13} />,
  "Instagram": <MessageSquare size={13} />,
  "Anúncios Meta Ads": <Target size={13} />,
  "Google Meu Negócio": <Search size={13} />,
  "WhatsApp Business": <MessageSquare size={13} />,
};

// ── Page ────────────────────────────────────────────────────────────────────

export default async function PortalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let clientData: Record<string, unknown>;
  try {
    const raw = await fs.readFile(path.join(CLIENTES_DIR, slug, "client.json"), "utf-8");
    clientData = JSON.parse(raw);
  } catch {
    notFound();
  }

  const [diagnostico, persona, swot, auditoria] = await Promise.all([
    readOutput(slug, "ee-s1-diagnostico-maturidade"),
    readOutput(slug, "ee-s1-persona-icp"),
    readOutput(slug, "ee-s1-swot"),
    readOutput(slug, "ee-s1-auditoria-comunicacao"),
  ]);

  const b = (clientData.briefing as Record<string, unknown>) ?? {};
  const id = (b.identification as Record<string, unknown>) ?? {};
  const name = (id.name as string) ?? slug;

  const completedAt = new Date("2026-05-29").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const navItems = [
    { id: "diagnostico", label: "Maturidade" },
    { id: "persona", label: "ICP & Persona" },
    { id: "swot", label: "SWOT" },
    { id: "auditoria", label: "Auditoria" },
  ].filter(n =>
    (n.id === "diagnostico" && diagnostico) ||
    (n.id === "persona" && persona) ||
    (n.id === "swot" && swot) ||
    (n.id === "auditoria" && auditoria)
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20" style={{
        background: "rgba(5,5,5,0.9)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
      }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/clientes/${slug}`} style={{ color: "var(--color-text-muted)" }}>
            <ArrowLeft size={15} />
          </Link>
          <div className="w-5 h-5 flex items-center justify-center font-black text-[9px] shrink-0"
            style={{ background: "var(--color-primary)", color: "#fff", clipPath: "polygon(10% 0%,100% 0%,90% 100%,0% 100%)" }}>
            V4
          </div>
          <span className="text-xs font-bold truncate" style={{ color: "var(--color-text)" }}>{name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-semibold ml-1"
            style={{ background: "rgba(228,10,20,0.12)", color: "var(--color-primary)", border: "1px solid rgba(228,10,20,0.25)" }}>
            Semana 1
          </span>
          <nav className="ml-auto hidden sm:flex items-center gap-1">
            {navItems.map(n => (
              <a key={n.id} href={`#${n.id}`}
                className="text-[10px] font-semibold px-2.5 py-1 rounded transition-colors"
                style={{ color: "var(--color-text-muted)" }}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-14">

        {/* Hero */}
        <div className="space-y-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
            Entregáveis — Semana 1
          </p>
          <h1 className="text-3xl font-black leading-tight" style={{ color: "var(--color-text)" }}>
            Diagnóstico Estratégico
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--color-text-muted)" }}>
            Base estratégica construída para a {name}. Tudo que vem a seguir — posicionamento, criativos, CRM — parte daqui.
          </p>
          <p className="text-xs" style={{ color: "#3a3a3a" }}>Gerado em {completedAt}</p>
        </div>

        {/* ── DIAGNÓSTICO ──────────────────────────────────────── */}
        {diagnostico && (
          <Section id="diagnostico" label="01 — Diagnóstico de Maturidade Digital">
            <Card accent>
              <div className="flex items-start gap-4 mb-5">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black" style={{ color: "var(--color-primary)" }}>
                    {diagnostico.scores?.geral?.score}
                  </p>
                  <p className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>/100</p>
                  <p className="text-[10px] font-black uppercase mt-1" style={{ color: "var(--color-primary)" }}>
                    {diagnostico.scores?.geral?.classification}
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-base mb-1" style={{ color: "var(--color-text)" }}>Score Geral</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {diagnostico.executive_summary?.paragraph_1}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: "midia_paga", label: "Mídia Paga" },
                  { key: "criativos", label: "Criativos" },
                  { key: "cro", label: "CRO" },
                  { key: "crm", label: "CRM" },
                  { key: "seo", label: "SEO" },
                ].map(({ key, label }) => (
                  <ScoreBar
                    key={key}
                    label={label}
                    score={diagnostico.scores?.[key]?.score ?? 0}
                    benchmark={diagnostico.benchmark?.pilares?.[key]?.setor}
                  />
                ))}
              </div>
              <p className="text-[10px] mt-3" style={{ color: "#3a3a3a" }}>
                A linha vertical indica a média do setor. {diagnostico.benchmark?.most_critical_gap}
              </p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card>
                <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "#facc15" }}>
                  Os 2 gaps que custam mais agora
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {diagnostico.executive_summary?.paragraph_2}
                </p>
              </Card>
              <Card>
                <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "#4ade80" }}>
                  O que precisa ser acelerado
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {diagnostico.executive_summary?.paragraph_3}
                </p>
              </Card>
            </div>

            <Card>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
                Prioridades de ação
              </p>
              <div className="space-y-3">
                {diagnostico.priorities?.slice(0, 5).map((p: { rank: number; action: string; why: string; effort: string }) => (
                  <div key={p.rank} className="flex gap-3">
                    <span className="text-sm font-black shrink-0 w-5" style={{ color: "var(--color-primary)" }}>
                      {p.rank}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{p.action}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{p.why}</p>
                      <Tag type={p.effort === "baixo" ? "positive" : p.effort === "médio" ? "opportunity" : "neutral"}>
                        esforço {p.effort}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>
        )}

        {/* ── PERSONA & ICP ─────────────────────────────────────── */}
        {persona && (
          <Section id="persona" label="02 — ICP & Persona">
            <Card accent>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "rgba(228,10,20,0.1)", border: "1px solid rgba(228,10,20,0.2)" }}>
                  👩
                </div>
                <div>
                  <h3 className="font-black text-lg" style={{ color: "var(--color-text)" }}>
                    {persona.persona?.nome}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {persona.icp_primario?.demografico?.faixa_etaria} · {persona.icp_primario?.demografico?.profissao}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    Renda {persona.icp_primario?.demografico?.renda} · {persona.icp_primario?.demografico?.localizacao?.split("—")[0]}
                  </p>
                </div>
              </div>
              <blockquote className="mt-4 pl-3 italic text-sm leading-relaxed"
                style={{ color: "var(--color-text)", borderLeft: "3px solid var(--color-primary)" }}>
                "{persona.persona?.frase_citacao}"
              </blockquote>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {persona.persona?.historia}
              </p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Job Funcional", text: persona.icp_primario?.jtbd?.funcional },
                { label: "Job Emocional", text: persona.icp_primario?.jtbd?.emocional },
                { label: "Job Social", text: persona.icp_primario?.jtbd?.social },
              ].map(({ label, text }) => (
                <Card key={label}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--color-primary)" }}>
                    {label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{text}</p>
                </Card>
              ))}
            </div>

            <Card>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
                Dores reais — em ordem de intensidade
              </p>
              <div className="space-y-3">
                {persona.icp_primario?.dores?.map((d: { rank: number; dor: string; insight: string }) => (
                  <div key={d.rank} className="flex gap-3">
                    <span className="text-sm font-black shrink-0" style={{ color: "var(--color-primary)" }}>
                      {d.rank}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{d.dor}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{d.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card accent>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--color-primary)" }}>
                Mensagem-chave aprovada
              </p>
              <p className="text-2xl font-black leading-tight" style={{ color: "var(--color-text)" }}>
                "{persona.mensagens_chave?.mensagem_aprovada}"
              </p>
              <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
                {persona.mensagens_chave?.opcoes?.find((o: { escolhida?: boolean; justificativa?: string }) => o.escolhida)?.justificativa ?? persona.mensagens_chave?.justificativa_escolha}
              </p>
            </Card>
          </Section>
        )}

        {/* ── SWOT ──────────────────────────────────────────────── */}
        {swot && (
          <Section id="swot" label="03 — Matriz SWOT">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuadrantCard
                title="Forças"
                icon={<TrendingUp size={14} />}
                items={swot.forcas ?? []}
                type="positive"
              />
              <QuadrantCard
                title="Fraquezas"
                icon={<TrendingDown size={14} />}
                items={swot.fraquezas ?? []}
                type="negative"
              />
              <QuadrantCard
                title="Oportunidades"
                icon={<Zap size={14} />}
                items={swot.oportunidades ?? []}
                type="opportunity"
              />
              <QuadrantCard
                title="Ameaças"
                icon={<AlertTriangle size={14} />}
                items={swot.ameacas ?? []}
                type="neutral"
              />
            </div>

            <Card accent>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "var(--color-primary)" }}>
                Síntese estratégica — 90 dias
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#4ade80" }}>Alavancagem</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{swot.sintese?.alavancagem}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#e40a14" }}>Proteção</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{swot.sintese?.protecao}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#facc15" }}>Estratégia recomendada</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{swot.sintese?.estrategia_90_dias}</p>
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
                Ações prioritárias
              </p>
              <div className="space-y-3">
                {swot.acoes_prioritarias?.map((a: { rank: number; acao: string; base_swot: string; impacto: string; prazo: string }) => (
                  <div key={a.rank} className="flex gap-3 items-start">
                    <span className="text-sm font-black shrink-0 w-5" style={{ color: "var(--color-primary)" }}>{a.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{a.acao}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{a.base_swot}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Tag type={a.impacto === "alto" ? "positive" : "neutral"}>{a.impacto}</Tag>
                      <Tag type="neutral">{a.prazo}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>
        )}

        {/* ── AUDITORIA ─────────────────────────────────────────── */}
        {auditoria && (
          <Section id="auditoria" label="04 — Auditoria de Comunicação">
            {/* Channel scores */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {auditoria.canais?.map((canal: { canal: string; score: number; classificacao: string }) => {
                const color = canal.score >= 60 ? "#4ade80" : canal.score >= 35 ? "#facc15" : "#e40a14";
                const shortName = canal.canal.replace("/ Landing Page", "").replace("Business", "").replace("Meta Ads", "").trim();
                return (
                  <div key={canal.canal} className="rounded-xl p-3 text-center" style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}>
                    <div style={{ color: "var(--color-text-muted)" }} className="flex justify-center mb-1">
                      {canalIcon[canal.canal] ?? <BarChart3 size={13} />}
                    </div>
                    <p className="text-xl font-black" style={{ color }}>{canal.score}</p>
                    <p className="text-[9px] font-bold mt-0.5 leading-tight" style={{ color: "var(--color-text-muted)" }}>{shortName}</p>
                    <p className="text-[9px] mt-0.5" style={{ color }}>{canal.classificacao}</p>
                  </div>
                );
              })}
            </div>

            {/* Top 3 problems */}
            <Card>
              <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: "var(--color-primary)" }}>
                Top 3 problemas que mais custam conversão agora
              </p>
              <div className="space-y-5">
                {[
                  auditoria.resumo_executivo?.problema_1,
                  auditoria.resumo_executivo?.problema_2,
                  auditoria.resumo_executivo?.problema_3,
                ].filter(Boolean).map((p: { titulo: string; evidencia: string; acao: string }, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-sm font-black shrink-0 w-5" style={{ color: "var(--color-primary)" }}>{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{p.titulo}</p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{p.evidencia}</p>
                      <p className="text-xs mt-1.5 font-semibold" style={{ color: "#4ade80" }}>→ {p.acao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick wins */}
            <Card>
              <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color: "#4ade80" }}>
                Quick wins — implementar esta semana
              </p>
              <div className="space-y-4">
                {auditoria.quick_wins?.map((qw: { rank: number; acao: string; canal: string; tempo_estimado: string; impacto: string; quem_faz: string }) => (
                  <div key={qw.rank} className="flex gap-3">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                      style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>
                      {qw.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{qw.acao}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Tag type="neutral">{qw.canal}</Tag>
                        <Tag type="positive">{qw.tempo_estimado}</Tag>
                        <Tag type="neutral">{qw.quem_faz}</Tag>
                      </div>
                      <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>{qw.impacto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>
        )}

        {/* Footer */}
        <div className="text-center space-y-2 pb-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center font-black text-[9px]"
              style={{ background: "var(--color-primary)", color: "#fff", clipPath: "polygon(10% 0%,100% 0%,90% 100%,0% 100%)" }}>
              V4
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>V4 Estruturação IA</span>
          </div>
          <p className="text-[10px]" style={{ color: "#2a2a2a" }}>
            {name} · Semana 1 · {completedAt}
          </p>
        </div>

      </div>
    </main>
  );
}
