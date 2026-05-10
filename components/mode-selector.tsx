"use client";

import { cn } from "@/lib/utils";
import { Bug, Lightbulb, GitBranch, Gauge } from "lucide-react";

export type TutoringMode = "debug" | "bigO" | "hint" | "trace";

interface ModeSelectorProps {
  selected: TutoringMode;
  onSelect: (mode: TutoringMode) => void;
}

const modes = [
  {
    id: "debug" as const,
    label: "Debug my code",
    description: "Find and fix bugs",
    icon: Bug,
  },
  {
    id: "bigO" as const,
    label: "Explain Big-O",
    description: "Time & space complexity",
    icon: Gauge,
  },
  {
    id: "hint" as const,
    label: "Give me a hint",
    description: "Gentle nudge forward",
    icon: Lightbulb,
  },
  {
    id: "trace" as const,
    label: "Trace my code",
    description: "Step through execution",
    icon: GitBranch,
  },
];

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selected === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card hover:border-primary/50 hover:bg-secondary"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground group-hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium leading-tight">{mode.label}</p>
              <p className="text-xs text-muted-foreground">{mode.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
