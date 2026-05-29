"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, CheckCircle2, Circle, ArrowRight, Lock } from "lucide-react";
import { Stage, Skill, SkillStatus } from "@/lib/workflow";
import { cn } from "@/lib/utils";

interface SkillCardProps {
  skill: Skill;
  status: SkillStatus;
  onStatusChange: (id: string, status: SkillStatus) => void;
  stageColor: string;
  stageBg: string;
}

function SkillCard({ skill, status, onStatusChange, stageColor, stageBg }: SkillCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    pending: { icon: Circle, label: "Pendente", color: "text-slate-400", bg: "bg-slate-50" },
    in_progress: { icon: ArrowRight, label: "Em andamento", color: "text-amber-500", bg: "bg-amber-50" },
    done: { icon: CheckCircle2, label: "Concluído", color: "text-emerald-500", bg: "bg-emerald-50" },
    blocked: { icon: Lock, label: "Bloqueado", color: "text-red-400", bg: "bg-red-50" },
  };

  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden transition-all", status === "done" && "opacity-75")}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <button
          className={cn("shrink-0 transition-colors", cfg.color)}
          onClick={(e) => {
            e.stopPropagation();
            const next: SkillStatus =
              status === "pending" ? "in_progress" : status === "in_progress" ? "done" : "pending";
            onStatusChange(skill.id, next);
          }}
        >
          <Icon size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", status === "done" ? "line-through text-slate-400" : "text-slate-800")}>
            {skill.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">{skill.time}</span>
          </div>
        </div>

        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>
          {cfg.label}
        </span>

        {expanded ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 space-y-3">
          <p className="text-xs text-slate-500">{skill.description}</p>

          {skill.dependencies.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Depende de</p>
              <div className="flex flex-wrap gap-1">
                {skill.dependencies.map((dep) => (
                  <span key={dep} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {dep.replace("ee-", "").replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Entregáveis</p>
            <ul className="space-y-1">
              {skill.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className={cn("mt-0.5 shrink-0 w-3 h-3 rounded-full flex items-center justify-center", stageBg)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", stageColor.replace("text-", "bg-"))} />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface StageCardProps {
  stage: Stage;
  statuses: Record<string, SkillStatus>;
  onStatusChange: (id: string, status: SkillStatus) => void;
}

export function StageCard({ stage, statuses, onStatusChange }: StageCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const done = stage.skills.filter((s) => statuses[s.id] === "done").length;
  const total = stage.skills.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className={cn("rounded-2xl border overflow-hidden", stage.border)}>
      <div
        className={cn("flex items-center justify-between px-4 py-3 cursor-pointer", stage.bg)}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold uppercase tracking-wider", stage.color)}>
                {stage.week}
              </span>
              {done === total && total > 0 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                  ✓ Completo
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-800">{stage.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={cn("text-xs font-semibold", stage.color)}>
              {done}/{total}
            </p>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1">
              <div
                className={cn("h-1.5 rounded-full transition-all", stage.color.replace("text-", "bg-"))}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          {collapsed ? <ChevronRight size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {!collapsed && (
        <div className="bg-white px-4 py-3 space-y-2">
          <p className="text-xs text-slate-500 italic mb-3">{stage.objective}</p>
          {stage.skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              status={statuses[skill.id] || "pending"}
              onStatusChange={onStatusChange}
              stageColor={stage.color}
              stageBg={stage.bg}
            />
          ))}
        </div>
      )}
    </div>
  );
}
