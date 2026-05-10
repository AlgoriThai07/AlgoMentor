import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
    "Focus on helping the student find bugs in their code. If the student is only asking for help, guide them with questions and hints. If the student explicitly asks for the final solution or corrected code, provide it in the guidingHint field.",
  bigO:
    "Focus on analyzing the time and space complexity. If the student asks for a solution, explain the optimized solution and put the final code in the guidingHint field.",
  hint:
    "Provide a gentle hint to help them get unstuck. If the student explicitly asks for the final solution or corrected code, provide it in the guidingHint field instead of only giving a hint.",
  trace:
    "Help them trace through their code step by step. If the student explicitly asks for the final solution or corrected code, provide it in the guidingHint field after explaining the trace issue.",
};

const tutorResponseSchema = {
  type: "OBJECT",
  properties: {
    whatYouDidWell: {
      type: "STRING",
    },
    mainIssue: {
      type: "STRING",
    },
    guidingHint: {
      type: "STRING",
    },
    bigOExplanation: {
      type: "STRING",
    },
    nextStep: {
      type: "STRING",
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
    whatYouDidWell:
      "You're taking a structured approach to the problem with clear variable names and logical flow.",
    mainIssue:
      "There's likely an edge case or condition check that's not quite right. Look at what happens when your loop reaches the end or when comparing values.",
    guidingHint:
      "What happens at the boundary conditions? What should the function return in the happy path versus when an edge case occurs?",
    bigOExplanation:
      "Your solution appears to have reasonable complexity. Consider whether you're doing any unnecessary work in nested loops or repeated operations.",
    nextStep:
      "Trace through your code with a simple test case. Write down the value of each variable at every step and check if the logic holds.",
  },
  bigO: {
    whatYouDidWell:
      "Your approach shows you understand the problem structure and are thinking about iteration and comparisons.",
    mainIssue:
      "The current solution may have a higher time complexity than necessary. Look for repeated work that could be optimized with a different data structure.",
    guidingHint:
      "What information do you need to find quickly? Is there a data structure that would let you look something up in constant time?",
    bigOExplanation:
      "Your current approach may be O(n²) or worse if it repeats work inside nested loops. An optimized solution often uses a hash map, set, or two-pointer strategy.",
    nextStep:
      "Try identifying which repeated operation is slowing the algorithm down, then choose a data structure that removes that repeated work.",
  },
  hint: {
    whatYouDidWell:
      "You've made a solid attempt and are on the right track with your overall approach.",
    mainIssue:
      "Something in your logic is not handling all cases correctly. It might be an off-by-one error, incorrect operator, or missing condition.",
    guidingHint:
      "What are the different cases your code needs to handle? Are you checking all of them?",
    bigOExplanation:
      "Think about whether your solution performs any unnecessary repeated work that could be optimized.",
    nextStep:
      "Test your code with a few different inputs, including edge cases such as empty input, one element, or values at the boundaries.",
  },
  trace: {
    whatYouDidWell:
      "Your code structure is clear and you're using appropriate control flow statements.",
    mainIssue:
      "The execution might not be going where you expect. The values of your variables may change differently from what you intended.",
    guidingHint:
      "Step through your code with a small input. What is the value of each variable after every line?",
    bigOExplanation:
      "Tracing does not change the complexity, but it helps reveal whether the algorithm is doing repeated or unnecessary work.",
    nextStep:
      "Create a small example and manually write down the value of each important variable after each loop iteration or function call.",
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

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<TutorResponse | null> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.log("OPENAI_API_KEY not set, skipping OpenAI fallback");
    return null;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1400,
        response_format: {
          type: "json_object",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return null;
    }

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content;

    if (!textContent) {
      console.error("OpenAI returned no text content:", data);
      return null;
    }

    const parsed = JSON.parse(cleanJsonContent(textContent));

    if (!isValidTutorResponse(parsed)) {
      console.error("OpenAI response has invalid shape:", parsed);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("OpenAI fallback error:", error);
    return null;
  }
}

async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<TutorResponse | null> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    console.log("GEMINI_API_KEY not set, skipping Gemini");
    return null;
  }

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
              text: systemPrompt,
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
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1400,
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
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return NextResponse.json(
      { error: "No API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY." },
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

Your goal is to help students learn, not simply give them the final answer.

The student may ask for different levels of help. You must decide from the student's question whether they want:
1. a hint,
2. debugging guidance,
3. a trace,
4. Big O analysis,
5. or the final corrected solution.

Important solution rule:
If the student explicitly asks for the final solution, final answer, full code, corrected code, fixed code, or asks you to solve it directly, you MAY provide the complete corrected code.
When you provide complete corrected code, put it inside the "guidingHint" field.
Do not create a separate "finalCode" field.
The UI only has a hint area, so final code must go in "guidingHint".

If the student does not clearly ask for the final solution, do not give the full final code.
Instead, use "guidingHint" for a helpful hint, guiding question, or next debugging clue.

When responding:
1. Identify what the student is trying to do.
2. Mention one thing they did correctly.
3. Explain the main issue in simple beginner-friendly language.
4. Use "guidingHint" either for a hint or, only when appropriate, for the final corrected code.
5. Explain time and space complexity when relevant.
6. Focus on reasoning, debugging, and learning.
7. Keep the response concise and structured.
8. Do not use markdown code fences.
9. Avoid backticks unless they are part of code.
10. Keep each field under 2 sentences unless the "guidingHint" field contains final code.

MODE-SPECIFIC FOCUS:
${modeInstructions[mode]}

You must respond with a JSON object containing exactly these 5 fields:
{
  "whatYouDidWell": "Specific positive feedback about their approach, code structure, or thinking",
  "mainIssue": "The primary issue or area for improvement, explained in beginner-friendly language",
  "guidingHint": "A hint or guiding question. If and only if the student asked for the final solution, put the complete corrected code here.",
  "bigOExplanation": "Analysis of time and space complexity of their current approach or the corrected approach",
  "nextStep": "A specific, actionable next step they should take"
}

Respond ONLY with the JSON object.`;

    const userPrompt = `Problem Statement:
${problemStatement || "Not provided"}

Student's Code:
${code}

Student's Question:
${question}`;

    let tutorResponse: TutorResponse | null = null;

    tutorResponse = await callGemini(systemPrompt, userPrompt);

    if (!tutorResponse) {
      console.log("Trying OpenAI fallback...");
      tutorResponse = await callOpenAI(systemPrompt, userPrompt);
    }

    if (!tutorResponse) {
      console.log("Both APIs failed, using static fallback response");
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