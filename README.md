# AlgoMentor

**AI-powered DSA tutoring that guides students without giving away the answer.**

AlgoMentor is a lightweight educational web app that helps students understand Data Structures and Algorithms through structured, TA-style feedback. Instead of simply generating full solutions, AlgoMentor helps students debug their reasoning, understand Big-O complexity, and move toward the next step with targeted hints.

---

## Why I Built This

As a Data Structures and Algorithms TA, I noticed that many students do not get stuck because they need the full solution immediately. More often, they need help identifying the exact point where their reasoning breaks.

Common student questions include:

- “Why does my loop always return true?”
- “Why is my binary search going out of bounds?”
- “Why is my solution too slow?”
- “What data structure should I think about here?”

AlgoMentor was built to recreate the most useful part of office hours: guiding students toward understanding rather than handing them the answer.

---

## What AlgoMentor Does

Students can paste in a DSA problem, their code, and a question they are confused about. AlgoMentor then responds with structured feedback:

- **What you did well**  
  Highlights the correct part of the student's thinking.

- **Main issue**  
  Explains the key bug or reasoning gap in beginner-friendly language.

- **Guiding hint**  
  Gives a next-step hint without immediately revealing the full answer.

- **Big-O explanation**  
  Explains time and space complexity when relevant.

- **Next step**  
  Suggests what the student should try next.

---

## Core Features

### Multiple Tutoring Modes

AlgoMentor supports different types of DSA help:

- **Debug my code**  
  Identifies logical bugs, edge cases, and incorrect assumptions.

- **Explain Big-O**  
  Breaks down time and space complexity in simple terms.

- **Give me a hint**  
  Provides a guided nudge instead of a complete solution.

- **Trace my code**  
  Helps students reason through how their code executes step by step.

---

## Product Philosophy

AlgoMentor is designed around one core idea:

> Good tutoring should help students think, not replace their thinking.

Many AI tools are optimized to produce answers quickly. AlgoMentor is intentionally designed to slow that process down in a helpful way by giving structured feedback, hints, and explanations before revealing a full solution.

This makes the app especially useful for beginner programmers who are still learning how to debug, trace code, and reason about algorithms.

---

## Example Use Case

A student enters the following code:

```python
def containsDuplicate(nums):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] == nums[j]:
                return True
    return False
```
And asks:
```
Why does this always return true?
```

AlgoMentor explains that the code compares each element with itself when ```i == j```, so ```nums[i] == nums[j]``` becomes true immediately. Instead of giving the final optimized solution right away, it guides the student to think about how to avoid comparing the same index twice.

---

## Tech Stack

- **Frontend:** Next.js / React
- **Styling:** Tailwind CSS
- **AI:** Gemini or OpenAI API
- **Deployment:** Vercel
- **Database:** None for MVP

The app is intentionally lightweight and focused on fast, usable prototyping.

---

## How AI Is Used

AI is used as the tutoring engine behind AlgoMentor. The model receives the student's selected mode, problem statement, code, and question, then returns a structured response using a carefully designed tutoring prompt.

The prompt instructs the AI to:

1. Act like a Data Structures and Algorithms teaching assistant.
2. Explain concepts in beginner-friendly language.
3. Focus on the student’s reasoning process.
4. Avoid giving away the full solution too early.
5. Provide hints, Big-O explanations, and next steps.

---

## Key Product Decisions

### 1. Structured Feedback Instead of Open-Ended Chat

Rather than creating a generic chatbot, AlgoMentor organizes every response into clear sections. This makes the feedback easier for students to understand and easier for reviewers to evaluate.

### 2. Hint-First Tutoring

The app is designed to guide students gradually. This supports learning better than immediately showing the final answer.

### 3. Focused MVP Scope

For this prototype, I prioritized the core learning experience over account management, persistence, or complex platform features. The goal was to build something useful, testable, and easy to demo quickly.

### 4. Example Prompts Included

AlgoMentor includes built-in examples so users can test the app immediately without needing to come up with their own DSA problem.

---

## Future Improvements

If I continued developing AlgoMentor, I would add:

- **Progressive hint ladder**  
  Students can reveal hints one at a time.

- **Code tracing visualization**  
  Show variable values and loop iterations step by step.

- **Teacher dashboard**  
  Help instructors see common mistakes students are making.

- **Mistake pattern tracking**  
  Identify recurring issues such as off-by-one errors, missing base cases, or inefficient nested loops.

- **Test case reasoning**  
  Allow students to enter a failing test case and see where their logic diverges from the expected result.

---

## Project Goal

AlgoMentor is not meant to replace teachers or TAs. It is meant to support students when they are stuck between lectures, assignments, and office hours.

The goal is to make AI feel less like an answer machine and more like a patient learning companion for students practicing algorithms.

---

## Live Demo

Project link: `[Add your deployed project link here]`

Loom demo: `[Add your Loom video link here]`
