import fs from "fs/promises";
import path from "path";
import { ClientCard } from "@/components/ClientCard";


const CLIENTES_DIR = process.env.CLIENTES_DIR ?? path.join(process.cwd(), "data/clientes");

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

        {clientes.map((c) => (
          <ClientCard key={c.slug} {...c} />
        ))}
      </div>
    </main>
  );
}
