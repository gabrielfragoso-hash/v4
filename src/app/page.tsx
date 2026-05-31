import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { MapPin, TrendingUp, CheckCircle2, Clock, ChevronRight } from "lucide-react";

const CLIENTES_DIR = "/Users/gabrielfragoso/clientes";

interface ClientMeta {
  slug: string;
  name: string;
  location: string;
  segment: string;
  revenue: string;
  currentWeek: number;
  totalSkills: number;
  doneSkills: number;
  inProgressSkills: number;
}

async function getClientes(): Promise<ClientMeta[]> {
  try {
    const entries = await fs.readdir(CLIENTES_DIR, { withFileTypes: true });
    const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const clients = await Promise.all(
      slugs.map(async (slug) => {
        try {
          const raw = await fs.readFile(path.join(CLIENTES_DIR, slug, "client.json"), "utf-8");
          const data = JSON.parse(raw);
          const b = data.briefing;
          const skills = data.progress?.skills ?? {};
          const total = Object.keys(skills).length;
          const done = Object.values(skills).filter(
            (s: unknown) => (s as { status: string }).status === "completed"
          ).length;
          const inProg = Object.values(skills).filter(
            (s: unknown) => (s as { status: string }).status === "in_progress"
          ).length;
          return {
            slug,
            name: b?.identification?.name ?? slug,
            location:
              b?.identification?.location_matrix?.split("—")?.[1]?.trim() ??
              b?.identification?.location_matrix ??
              "—",
            segment: b?.identification?.segment ?? "—",
            revenue: b?.financials?.faturamento_medio_mensal ?? b?.identification?.annual_revenue ?? "—",
            currentWeek: data.progress?.current_week ?? 1,
            totalSkills: total,
            doneSkills: done,
            inProgressSkills: inProg,
          } as ClientMeta;
        } catch {
          return null;
        }
      })
    );

    return clients.filter(Boolean) as ClientMeta[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const clientes = await getClientes();

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="sticky top-0 z-10"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* V4 Logo mark */}
            <div
              className="w-7 h-7 flex items-center justify-center font-black text-sm"
              style={{
                background: "var(--color-primary)",
                color: "#fff",
                clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)",
              }}
            >
              V4
            </div>
            <span className="font-bold text-sm tracking-wide" style={{ color: "var(--color-text)" }}>
              Estruturação IA
            </span>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded"
            style={{ background: "var(--color-surface-elevated)", color: "var(--color-text-muted)" }}>
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest px-1"
          style={{ color: "var(--color-text-muted)" }}>
          Clientes ativos
        </p>

        {clientes.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Nenhum cliente encontrado em {CLIENTES_DIR}
            </p>
          </div>
        )}

        {clientes.map((c) => {
          const pct = c.totalSkills > 0 ? Math.round((c.doneSkills / c.totalSkills) * 100) : 0;

          return (
            <Link
              key={c.slug}
              href={`/clientes/${c.slug}`}
              className="block rounded-xl p-4 group transition-all"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(228,10,20,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm truncate" style={{ color: "var(--color-text)" }}>
                      {c.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                      style={{
                        background: "rgba(228,10,20,0.15)",
                        color: "var(--color-primary)",
                        border: "1px solid rgba(228,10,20,0.3)",
                      }}
                    >
                      S{c.currentWeek}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
                    {c.segment}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {c.location && c.location !== "—" && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                        <MapPin size={10} /> {c.location.split("/")[0].trim()}
                      </span>
                    )}
                    {c.revenue && c.revenue !== "—" && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                        <TrendingUp size={10} /> {c.revenue}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg font-black" style={{ color: "var(--color-primary)" }}>
                      {pct}%
                    </span>
                    <div
                      className="w-24 h-1 rounded-full overflow-hidden"
                      style={{ background: "var(--color-border)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: "var(--color-primary)",
                          boxShadow: pct > 0 ? "0 0 8px rgba(228,10,20,0.6)" : "none",
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                      <span className="flex items-center gap-0.5">
                        <CheckCircle2 size={9} style={{ color: "#4ade80" }} />
                        {c.doneSkills}/{c.totalSkills}
                      </span>
                      {c.inProgressSkills > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} style={{ color: "#facc15" }} />
                          {c.inProgressSkills}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--color-border)" }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
