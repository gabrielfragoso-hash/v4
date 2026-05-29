import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { Zap, MapPin, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

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
          const done = Object.values(skills).filter((s: unknown) => (s as { status: string }).status === "completed").length;
          const inProg = Object.values(skills).filter((s: unknown) => (s as { status: string }).status === "in_progress").length;
          return {
            slug,
            name: b?.identification?.name ?? slug,
            location: b?.identification?.location_matrix?.split("—")[1]?.trim() ?? b?.identification?.location_matrix ?? "—",
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
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-sm">V4 Estruturação IA</span>
          <span className="ml-auto text-xs text-slate-400">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Clientes ativos</h2>

        {clientes.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-slate-400 text-sm">Nenhum cliente encontrado em {CLIENTES_DIR}</p>
          </div>
        )}

        {clientes.map((c) => {
          const pct = c.totalSkills > 0 ? Math.round((c.doneSkills / c.totalSkills) * 100) : 0;
          return (
            <Link
              key={c.slug}
              href={`/clientes/${c.slug}`}
              className="block bg-white rounded-2xl border border-slate-200 p-4 hover:border-violet-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors truncate">
                      {c.name}
                    </h3>
                    <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                      S{c.currentWeek}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{c.segment}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {c.location && c.location !== "—" && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={10} /> {c.location.split("/")[0].trim()}
                      </span>
                    )}
                    {c.revenue && c.revenue !== "—" && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <TrendingUp size={10} /> {c.revenue}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold text-violet-600">{pct}%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <CheckCircle2 size={9} className="text-emerald-500" />
                      {c.doneSkills}/{c.totalSkills}
                    </span>
                    {c.inProgressSkills > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Clock size={9} className="text-amber-500" />
                        {c.inProgressSkills}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
