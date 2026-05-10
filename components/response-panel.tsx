"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Gauge,
  ArrowRight,
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
}

function ResponseSection({
  icon,
  title,
  content,
  variant = "default",
}: ResponseSectionProps) {
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
        <span>{title}</span>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground pl-7 prose prose-sm prose-invert max-w-none prose-p:my-1 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-strong:text-foreground">
        <ReactMarkdown>{content}</ReactMarkdown>
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
