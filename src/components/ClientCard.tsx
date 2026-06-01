"use client";

import Link from "next/link";
import { MapPin, TrendingUp, CheckCircle2, Clock, ChevronRight } from "lucide-react";

interface ClientCardProps {
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

export function ClientCard({
  slug,
  name,
  location,
  segment,
  revenue,
  currentWeek,
  totalSkills,
  doneSkills,
  inProgressSkills,
}: ClientCardProps) {
  const pct = totalSkills > 0 ? Math.round((doneSkills / totalSkills) * 100) : 0;

  return (
    <Link
      href={`/clientes/${slug}`}
      className="v4-client-card block rounded-xl p-4 transition-all"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <style>{`
        .v4-client-card:hover {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 20px rgba(228,10,20,0.15);
        }
      `}</style>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm truncate" style={{ color: "var(--color-text)" }}>
              {name}
            </h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
              style={{
                background: "rgba(228,10,20,0.15)",
                color: "var(--color-primary)",
                border: "1px solid rgba(228,10,20,0.3)",
              }}
            >
              S{currentWeek}
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
            {segment}
          </p>
          <div className="flex items-center gap-3 mt-2">
            {location && location !== "—" && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <MapPin size={10} /> {location.split("/")[0].trim()}
              </span>
            )}
            {revenue && revenue !== "—" && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <TrendingUp size={10} /> {revenue}
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
                {doneSkills}/{totalSkills}
              </span>
              {inProgressSkills > 0 && (
                <span className="flex items-center gap-0.5">
                  <Clock size={9} style={{ color: "#facc15" }} />
                  {inProgressSkills}
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--color-border)" }} />
        </div>
      </div>
    </Link>
  );
}
