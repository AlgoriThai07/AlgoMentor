"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { TutoringMode } from "./mode-selector";

interface ExamplePrompt {
  label: string;
  problem: string;
  code: string;
  question: string;
  mode: TutoringMode;
}

const examples: ExamplePrompt[] = [
  {
    label: "Contains Duplicate bug",
    mode: "debug",
    problem:
      "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    code: `def containsDuplicate(nums):
    seen = set()
    for num in nums:
        if num in seen:
            return True
        seen.add(num)
    return True  # Bug: should return False`,
    question:
      "My code returns True for [1, 2, 3] but I expected False. What am I doing wrong?",
  },
  {
    label: "Binary Search off-by-one",
    mode: "debug",
    problem:
      "Given a sorted array of integers and a target value, return the index if the target is found. If not, return -1.",
    code: `def binarySearch(nums, target):
    left, right = 0, len(nums)
    while left < right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid
        else:
            right = mid
    return -1`,
    question:
      "My binary search gets stuck in an infinite loop sometimes. Can you help me understand why?",
  },
  {
    label: "Recursion confusion",
    mode: "trace",
    problem:
      "Write a recursive function to calculate the nth Fibonacci number.",
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    question:
      "I don't understand how the recursion works. Can you trace through fib(4)?",
  },
  {
    label: "HashMap optimization",
    mode: "bigO",
    problem:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
    question:
      "This solution works but it's O(n²). How can I optimize it using a HashMap?",
  },
];

interface ExamplePromptsProps {
  onSelect: (example: {
    problem: string;
    code: string;
    question: string;
    mode: TutoringMode;
  }) => void;
}

export function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Try an example:
      </span>
      {examples.map((example) => (
        <Button
          key={example.label}
          variant="outline"
          size="sm"
          onClick={() =>
            onSelect({
              problem: example.problem,
              code: example.code,
              question: example.question,
              mode: example.mode,
            })
          }
          className="h-8 text-xs"
        >
          {example.label}
        </Button>
      ))}
    </div>
  );
}
