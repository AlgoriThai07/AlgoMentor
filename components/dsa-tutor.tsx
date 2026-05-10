"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeSelector, type TutoringMode } from "./mode-selector";
import { CodeInput } from "./code-input";
import { ExamplePrompts } from "./example-prompts";
import { ResponsePanel, type TutorResponse } from "./response-panel";
import { Send, GraduationCap } from "lucide-react";

export function DSATutor() {
  const [mode, setMode] = useState<TutoringMode>("debug");
  const [problemStatement, setProblemStatement] = useState("");
  const [code, setCode] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim() || !question.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          problemStatement,
          code,
          question,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData.error);
        return;
      }

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Failed to get feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleSelect = (example: {
    problem: string;
    code: string;
    question: string;
    mode: TutoringMode;
  }) => {
    setProblemStatement(example.problem);
    setCode(example.code);
    setQuestion(example.question);
    setMode(example.mode);
    setResponse(null);
  };

  const isSubmitDisabled = !code.trim() || !question.trim() || isLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                AlgoMentor
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered tutoring for data structures & algorithms
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Paste your DSA code and get TA-style feedback without immediately
            being given the answer. Learn by understanding, not copying.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Mode Selector */}
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-foreground">
                What do you need help with?
              </h2>
              <ModeSelector selected={mode} onSelect={setMode} />
            </div>

            {/* Code Input */}
            <CodeInput
              problemStatement={problemStatement}
              onProblemStatementChange={setProblemStatement}
              code={code}
              onCodeChange={setCode}
              question={question}
              onQuestionChange={setQuestion}
            />

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                "Analyzing..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Get Feedback
                </>
              )}
            </Button>

            {/* Example Prompts */}
            <ExamplePrompts onSelect={handleExampleSelect} />
          </div>

          {/* Right Column - Response */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ResponsePanel response={response} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
