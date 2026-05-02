// Morning OS AI endpoint — handles 3 actions via Lovable AI Gateway:
//   - study_questions: real spaced-repetition questions from yesterday's topic
//   - briefing: news summary on user's interests
//   - focus: a personalized priority for today

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

interface Body {
  action: "study_questions" | "briefing" | "focus";
  studyTopic?: string;
  studyMaterial?: string;
  interests?: string;
  fitnessGoal?: string;
  dayOfWeek?: string;
}

async function callAI(messages: any[], tool: any) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });

  if (res.status === 429) throw new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (res.status === 402) throw new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t}`);
  }
  const data = await res.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("No tool call in AI response");
  return JSON.parse(args);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;

    if (body.action === "study_questions") {
      const topic = (body.studyTopic || "").trim();
      if (!topic) {
        return new Response(JSON.stringify({ error: "studyTopic required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const result = await callAI(
        [
          { role: "system", content: "You are a study coach using active recall and spaced repetition. Generate questions that force the student to retrieve, not just recognize." },
          { role: "user", content: `The student studied this yesterday: "${topic}".\n\nGenerate exactly 3 active-recall questions (concept, application, common mistake) and one "explain it simply" prompt. Be specific to the topic — no generic questions.` },
        ],
        {
          type: "function",
          function: {
            name: "return_review",
            description: "Return study review questions",
            parameters: {
              type: "object",
              properties: {
                questions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                explainPrompt: { type: "string" },
              },
              required: ["questions", "explainPrompt"],
              additionalProperties: false,
            },
          },
        }
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "briefing") {
      const interests = (body.interests || "general world news, technology").trim();
      const result = await callAI(
        [
          { role: "system", content: "You are a morning briefing writer for a busy student. Concise, factual, no fluff. You may invent realistic plausible headlines (this is a demo) but keep them grounded and recent in tone." },
          { role: "user", content: `Write a 3-headline briefing for someone interested in: ${interests}.\n\nThen add one short "deep dive" — a single useful idea/concept they can think about today (~2 sentences). Tone: smart, calm, no hype.` },
        ],
        {
          type: "function",
          function: {
            name: "return_briefing",
            description: "Return a morning briefing",
            parameters: {
              type: "object",
              properties: {
                news: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      summary: { type: "string" },
                    },
                    required: ["title", "summary"],
                    additionalProperties: false,
                  },
                },
                deepDive: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                  },
                  required: ["title", "summary"],
                  additionalProperties: false,
                },
              },
              required: ["news", "deepDive"],
              additionalProperties: false,
            },
          },
        }
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.action === "focus") {
      const day = body.dayOfWeek || new Date().toLocaleDateString("en-US", { weekday: "long" });
      const ctx = [
        body.studyTopic ? `Currently studying: ${body.studyTopic}` : "",
        body.fitnessGoal ? `Fitness goal: ${body.fitnessGoal}` : "",
        body.interests ? `Interests: ${body.interests}` : "",
      ].filter(Boolean).join(". ");

      const result = await callAI(
        [
          { role: "system", content: "You write ONE sharp daily priority for a student. One sentence. Action verb first. Concrete, not generic. Avoid clichés like 'crush it' or 'seize the day'." },
          { role: "user", content: `Today is ${day}. ${ctx}\n\nWrite the single most important thing this student should do today. One sentence, max 14 words.` },
        ],
        {
          type: "function",
          function: {
            name: "return_focus",
            description: "Return today's focus",
            parameters: {
              type: "object",
              properties: { focus: { type: "string" } },
              required: ["focus"],
              additionalProperties: false,
            },
          },
        }
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("morning-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
