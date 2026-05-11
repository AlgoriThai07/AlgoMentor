"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Gauge,
  ArrowRight,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export interface TutorResponse {
  whatYouDidWell: string;
  mainIssue: string;
  guidingHint: string;
  bigOExplanation: string;
  nextStep: string;
}

interface ResponsePanelProps {
  response: TutorResponse | null;
  isLoading?: boolean;
}

interface ResponseSectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  variant?: "success" | "warning" | "info" | "default";
  allowCodeBlock?: boolean;
}

function looksLikeCode(content: string) {
  const codeSignals = [
    "class ",
    "const ",
    "let ",
    "var ",
    "def ",
    "public ",
    "private ",
    "while ",
    "elif ",
    "{",
    "}",
    ";",
  ];

  return codeSignals.some((signal) => content.includes(signal));
}

function formatCodeLikeText(content: string) {
  return content
    .replace(/(Here is[^:]*:)\s*/i, "$1\n\n")
    .replace(/(def\s+\w+\([^)]*\):)\s*/g, "$1\n    ")
    .replace(/(function\s+\w+\([^)]*\)\s*\{)\s*/g, "$1\n  ")
    .replace(/\s{2,}(while\s+)/g, "\n    $1")
    .replace(/\s{2,}(for\s+)/g, "\n    $1")
    .replace(/\s{2,}(if\s+)/g, "\n        $1")
    .replace(/\s{2,}(elif\s+)/g, "\n        $1")
    .replace(/\s{2,}(else:)/g, "\n        $1")
    .replace(/\s{2,}(return\s+)/g, "\n    $1")
    .replace(/\s{2,}(left\b)/g, "\n    $1")
    .replace(/\s{2,}(right\b)/g, "\n    $1")
    .replace(/\s{2,}(mid\b)/g, "\n        $1");
}

function splitIntroAndCode(content: string) {
  const lines = content.split("\n");

  const firstCodeLineIndex = lines.findIndex((line) => {
    const trimmed = line.trim();

    return (
      trimmed.startsWith("function ") ||
      trimmed.startsWith("class ") ||
      trimmed.startsWith("const ") ||
      trimmed.startsWith("let ") ||
      trimmed.startsWith("var ") ||
      trimmed.startsWith("def ") ||
      trimmed.startsWith("public ") ||
      trimmed.startsWith("private ") ||
      trimmed.startsWith("while ") ||
      trimmed.startsWith("for ") ||
      trimmed.startsWith("if ")
    );
  });

  if (firstCodeLineIndex === -1) {
    return {
      intro: "",
      code: content,
    };
  }

  return {
    intro: lines.slice(0, firstCodeLineIndex).join("\n").trim(),
    code: lines.slice(firstCodeLineIndex).join("\n").trim(),
  };
}

function ResponseSection({
  icon,
  title,
  content,
  variant = "default",
  allowCodeBlock = false,
}: ResponseSectionProps) {
  const shouldRenderCode = allowCodeBlock && looksLikeCode(content);

  const formattedContent = shouldRenderCode
    ? formatCodeLikeText(content)
    : content;

  const { intro, code } = shouldRenderCode
    ? splitIntroAndCode(formattedContent)
    : { intro: "", code: "" };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 font-medium",
          variant === "success" && "text-success",
          variant === "warning" && "text-warning",
          variant === "info" && "text-info"
        )}
      >
        {icon}
        <span>{shouldRenderCode ? "Solution" : title}</span>
      </div>

      <div className="pl-7">
        {shouldRenderCode ? (
          <div className="space-y-3">
            {intro && (
              <div className="text-sm leading-relaxed text-muted-foreground prose prose-sm prose-invert max-w-none prose-p:my-1 prose-strong:text-foreground">
                <ReactMarkdown>{intro}</ReactMarkdown>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
                <Code2 className="h-4 w-4" />
                Corrected code
              </div>

              <pre className="max-h-[520px] overflow-y-auto whitespace-pre-wrap break-words p-4 text-sm leading-6 text-foreground">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-muted-foreground prose prose-sm prose-invert max-w-none prose-p:my-1 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-strong:text-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-muted" />
            <div className="h-5 w-32 rounded bg-muted" />
          </div>
          <div className="pl-7 space-y-1.5">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
        <Lightbulb className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-foreground mb-1">
        Ready to help you learn
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Select a mode, paste your code, and ask a question. I&apos;ll provide
        TA-style guidance without giving away the answer.
      </p>
    </div>
  );
}

export function ResponsePanel({ response, isLoading }: ResponsePanelProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Analyzing your code...
        </h2>
        <LoadingSkeleton />
      </Card>
    );
  }

  if (!response) {
    return (
      <Card className="p-6 bg-card border-border">
        <EmptyState />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold mb-6 text-foreground">
        Feedback from your TA
      </h2>

      <div className="space-y-5">
        <ResponseSection
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="What you did well"
          content={response.whatYouDidWell}
          variant="success"
        />

        <Separator className="bg-border" />

        <ResponseSection
          icon={<AlertCircle className="h-5 w-5" />}
          title="Main issue"
          content={response.mainIssue}
          variant="warning"
        />

        <Separator className="bg-border" />

        <ResponseSection
          icon={<Lightbulb className="h-5 w-5" />}
          title="Guiding hint"
          content={response.guidingHint}
          allowCodeBlock
        />

        <Separator className="bg-border" />

        <ResponseSection
          icon={<Gauge className="h-5 w-5" />}
          title="Big-O explanation"
          content={response.bigOExplanation}
          variant="info"
        />

        <Separator className="bg-border" />

        <ResponseSection
          icon={<ArrowRight className="h-5 w-5" />}
          title="Next step"
          content={response.nextStep}
        />
      </div>
    </Card>
  );
}