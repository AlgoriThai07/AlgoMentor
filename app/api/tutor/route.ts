import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

type TutoringMode = "debug" | "bigO" | "hint" | "trace";

interface TutorRequest {
  mode: TutoringMode;
  problemStatement: string;
  code: string;
  question: string;
}

interface TutorResponse {
  whatYouDidWell: string;
  mainIssue: string;
  guidingHint: string;
  bigOExplanation: string;
  nextStep: string;
}

const modeInstructions: Record<TutoringMode, string> = {
  debug:
    "Focus on helping the student find bugs in their code. If they only ask for help, guide them with questions and hints. If they explicitly ask for the final solution or corrected code, provide it in the guidingHint field.",
  bigO:
    "Focus on analyzing time and space complexity. If the student asks for a solution, explain the optimized approach and put the final code in the guidingHint field.",
  hint:
    "Provide a gentle hint to help them get unstuck. If the student explicitly asks for the final solution or corrected code, provide it in the guidingHint field instead of only giving a hint.",
  trace:
    "Help them trace the code, but do not produce a full trace for long inputs. Show only the first 2-3 important iterations, then summarize the pattern. If the student asks for final code, provide it in the guidingHint field instead.",
};

const tutorResponseSchema = {
  type: "OBJECT",
  properties: {
    whatYouDidWell: {
      type: "STRING",
      description: "One short positive observation about the student's attempt.",
    },
    mainIssue: {
      type: "STRING",
      description: "One short explanation of the main issue.",
    },
    guidingHint: {
      type: "STRING",
      description:
        "A hint, or if the student asked for the final solution, the complete corrected code. If code is included, it must contain real newline characters and indentation, not one-line code.",
    },
    bigOExplanation: {
      type: "STRING",
      description: "One short Big-O explanation.",
    },
    nextStep: {
      type: "STRING",
      description: "One short next action.",
    },
  },
  required: [
    "whatYouDidWell",
    "mainIssue",
    "guidingHint",
    "bigOExplanation",
    "nextStep",
  ],
  propertyOrdering: [
    "whatYouDidWell",
    "mainIssue",
    "guidingHint",
    "bigOExplanation",
    "nextStep",
  ],
};

const fallbackResponses: Record<TutoringMode, TutorResponse> = {
  debug: {
    whatYouDidWell: "You're taking a structured approach with clear logic.",
    mainIssue:
      "There may be an edge case or condition that is not handled correctly.",
    guidingHint:
      "Trace your code with a small input and check how each variable changes after every loop iteration.",
    bigOExplanation:
      "Your current complexity depends on how many times your loops or recursive calls repeat.",
    nextStep:
      "Test your code with boundary cases such as empty input, one element, and values at the edges.",
  },
  bigO: {
    whatYouDidWell: "You are thinking about the structure of the algorithm.",
    mainIssue:
      "There may be repeated work that can be reduced with a better data structure or strategy.",
    guidingHint:
      "Ask yourself what information you repeatedly search for and whether it can be stored for faster lookup.",
    bigOExplanation:
      "If your code has nested loops, it may be O(n²); using a set, map, or two pointers may reduce it.",
    nextStep:
      "Identify the repeated operation and try replacing it with a more efficient lookup or pointer movement.",
  },
  hint: {
    whatYouDidWell:
      "You've made a reasonable attempt and have the right general direction.",
    mainIssue: "One part of the logic may not handle all cases correctly.",
    guidingHint:
      "List the different cases your code must handle, then check whether your conditions cover each one.",
    bigOExplanation: "Check whether your code repeats work that could be avoided.",
    nextStep: "Run your code on a simple normal case and one edge case.",
  },
  trace: {
    whatYouDidWell: "Your code has a clear structure to trace.",
    mainIssue: "The variable values may not be changing the way you expect.",
    guidingHint:
      "Pick a tiny input and write down only the first few important variable changes instead of tracing the entire input.",
    bigOExplanation:
      "Tracing helps reveal repeated work, but it does not change the algorithm's complexity.",
    nextStep:
      "Create a small table with columns for each important variable and fill in the first few iterations.",
  },
};

function isValidTutorResponse(value: unknown): value is TutorResponse {
  if (!value || typeof value !== "object") return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.whatYouDidWell === "string" &&
    typeof obj.mainIssue === "string" &&
    typeof obj.guidingHint === "string" &&
    typeof obj.bigOExplanation === "string" &&
    typeof obj.nextStep === "string"
  );
}

function cleanJsonContent(content: string): string {
  return content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  return (
    text.slice(0, maxChars) +
    "\n\n[Truncated because the input was too long.]"
  );
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  compact = false
): Promise<TutorResponse | null> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    console.log("GEMINI_API_KEY is not set.");
    return null;
  }

  const finalSystemPrompt = compact
    ? `${systemPrompt}

CRITICAL COMPACT RETRY:
Your previous response was too long and hit MAX_TOKENS.
Return a much shorter answer.
Do not provide a full trace.
Do not include long walkthroughs.
Keep guidingHint under 500 characters unless it contains final corrected code.
If guidingHint contains code, it must use real newline characters and indentation.
Never put code on one line.
Keep all other fields under 1 short sentence.
Respond only with valid JSON.`
    : systemPrompt;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey,
      },
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: finalSystemPrompt,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: userPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          maxOutputTokens: compact ? 2048 : 4096,
          responseMimeType: "application/json",
          responseSchema: tutorResponseSchema,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return null;
    }

    const data = await response.json();

    const candidate = data.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const textContent = candidate?.content?.parts?.[0]?.text;

    if (finishReason === "MAX_TOKENS") {
      console.error("Gemini hit MAX_TOKENS:", { textContent });
      return null;
    }

    if (finishReason && finishReason !== "STOP") {
      console.error("Gemini did not finish normally:", {
        finishReason,
        textContent,
      });
      return null;
    }

    if (!textContent) {
      console.error("Gemini returned no text content:", data);
      return null;
    }

    const parsed = JSON.parse(cleanJsonContent(textContent));

    if (!isValidTutorResponse(parsed)) {
      console.error("Gemini response has invalid shape:", parsed);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Gemini request or parse error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return NextResponse.json(
      { error: "No API key configured. Set GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const body: TutorRequest = await request.json();
    const { mode, problemStatement, code, question } = body;

    if (!mode || !modeInstructions[mode]) {
      return NextResponse.json(
        { error: "Invalid mode. Use debug, bigO, hint, or trace." },
        { status: 400 }
      );
    }

    if (!code || !question) {
      return NextResponse.json(
        { error: "Code and question are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a Data Structures and Algorithms teaching assistant.

The student may ask for:
1. a hint,
2. debugging guidance,
3. a trace,
4. Big O analysis,
5. or the final corrected solution.

You must decide from the student's question whether they want guidance or the final solution.

Important solution rule:
If the student explicitly asks for the final solution, final answer, full code, corrected code, fixed code, or asks you to solve it directly, you may provide the complete corrected code.
When you provide complete corrected code, put it inside the "guidingHint" field.
Do not create a separate "finalCode" field.
The UI only has a hint area, so final code must go in "guidingHint".

If the student does not clearly ask for the final solution, do not give the full final code.
Instead, use "guidingHint" for one helpful hint or guiding question.

Critical code formatting rule:
If you provide final code inside guidingHint:
1. Start with one short sentence.
2. Then add a blank line.
3. Then write the corrected code with real newline characters and indentation.
4. Never put the entire code on one line.
5. Do not use markdown code fences.
6. Do not use inline markdown for the code.

Style rules:
1. Keep whatYouDidWell under 1 short sentence.
2. Keep mainIssue under 1 short sentence.
3. Keep bigOExplanation under 1 short sentence.
4. Keep nextStep under 1 short sentence.
5. Keep guidingHint under 900 characters unless it contains final corrected code.
6. If the mode is trace, do not trace the entire input. Show only the first 2-3 key iterations and summarize the pattern.
7. Do not write long walkthroughs.
8. Do not include extra fields.
9. Respond only with valid JSON.

MODE-SPECIFIC FOCUS:
${modeInstructions[mode]}

Return exactly this JSON shape:
{
  "whatYouDidWell": "One short positive observation.",
  "mainIssue": "One short explanation of the main issue.",
  "guidingHint": "A hint, or if the student asked for the final solution, one short intro sentence, then a blank line, then the complete corrected code with real newlines and indentation.",
  "bigOExplanation": "One short Big O explanation.",
  "nextStep": "One short next action."
}`;

    const userPrompt = `Problem Statement:
${truncateText(problemStatement || "Not provided", 3000)}

Student's Code:
${truncateText(code, 6000)}

Student's Question:
${truncateText(question, 1000)}`;

    let tutorResponse = await callGemini(systemPrompt, userPrompt);

    if (!tutorResponse) {
      console.log("Gemini failed once, retrying with compact prompt...");
      tutorResponse = await callGemini(systemPrompt, userPrompt, true);
    }

    if (!tutorResponse) {
      console.log("Gemini failed, using static fallback response.");
      return NextResponse.json(fallbackResponses[mode]);
    }

    return NextResponse.json(tutorResponse);
  } catch (error) {
    console.error("API route error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}