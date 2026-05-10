"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CodeInputProps {
  problemStatement: string;
  onProblemStatementChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  question: string;
  onQuestionChange: (value: string) => void;
}

export function CodeInput({
  problemStatement,
  onProblemStatementChange,
  code,
  onCodeChange,
  question,
  onQuestionChange,
}: CodeInputProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="problem" className="text-foreground">
          Problem Statement
        </Label>
        <Textarea
          id="problem"
          placeholder="Paste the problem description here (e.g., 'Given an array of integers, return indices of two numbers that add up to target...')"
          value={problemStatement}
          onChange={(e) => onProblemStatementChange(e.target.value)}
          className="min-h-[100px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-foreground">
          Your Code
        </Label>
        <Textarea
          id="code"
          placeholder={`def solution(nums):\n    # Paste your code here\n    pass`}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="min-h-[200px] font-mono text-sm bg-code-bg border-code-border text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question" className="text-foreground">
          Your Question
        </Label>
        <Textarea
          id="question"
          placeholder="What specific help do you need? (e.g., 'My code returns wrong output for edge cases' or 'I don't understand why this is O(n²)')"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          className="min-h-[80px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>
    </div>
  );
}
