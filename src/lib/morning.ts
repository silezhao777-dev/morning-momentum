import { supabase } from "@/integrations/supabase/client";

export type FitnessGoal = "fat_loss" | "muscle_gain" | "maintain" | "low_energy";
export type Energy = "good" | "okay" | "tired";

export interface RoutineSetup {
  studyTopic: string;
  studyMaterial?: string; // text extracted from uploaded PDF
  studyMaterialName?: string;
  fitnessGoal: FitnessGoal;
  interests: string;
}

export const STORAGE_KEY = "morning-os-setup";

export function loadSetup(): RoutineSetup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { interests: "", studyMaterial: "", studyMaterialName: "", ...parsed };
  } catch {
    return null;
  }
}

export function saveSetup(s: RoutineSetup) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/* ---------- Local generators (no AI needed) ---------- */

export function generatePhysicalActivity(energy: Energy, goal: FitnessGoal) {
  if (energy === "tired") {
    return {
      title: "2-minute gentle stretch",
      detail: "Neck rolls, shoulder shrugs, and a slow forward fold. Breathe deep on each move.",
      duration: "2 min",
    };
  }
  if (goal === "fat_loss" || energy === "good") {
    return {
      title: "5-minute brisk walk",
      detail: "Step outside or pace your room. Get the heart rate up — no phone, just movement.",
      duration: "5 min",
    };
  }
  if (goal === "muscle_gain") {
    return {
      title: "10 push-ups + 15 squats",
      detail: "Two rounds. Slow on the way down, controlled on the way up.",
      duration: "4 min",
    };
  }
  return {
    title: "3-minute mobility flow",
    detail: "Cat-cow, hip openers, arm circles. Wake up the joints before the brain.",
    duration: "3 min",
  };
}

export function generateBreakfast(goal: FitnessGoal) {
  const map: Record<FitnessGoal, { title: string; items: string[]; time: string }[]> = {
    fat_loss: [
      { title: "Greek yogurt bowl", items: ["200g Greek yogurt", "Handful of berries", "1 tsp honey"], time: "2 min" },
      { title: "Veggie omelette", items: ["2 eggs", "Spinach + tomato", "Black coffee"], time: "6 min" },
    ],
    muscle_gain: [
      { title: "Oats + protein", items: ["80g oats", "1 scoop whey", "Banana + peanut butter"], time: "5 min" },
      { title: "Eggs on toast", items: ["3 eggs scrambled", "2 slices whole-grain toast", "Glass of milk"], time: "7 min" },
    ],
    maintain: [
      { title: "Avocado toast", items: ["2 slices toast", "½ avocado", "1 boiled egg"], time: "5 min" },
      { title: "Banana smoothie", items: ["1 banana", "Milk", "Oats + cinnamon"], time: "3 min" },
    ],
    low_energy: [
      { title: "Banana + almond butter", items: ["1 banana", "1 tbsp almond butter", "Glass of water"], time: "1 min" },
      { title: "Oatmeal with honey", items: ["50g oats", "Warm milk", "1 tsp honey"], time: "4 min" },
    ],
  };
  return map[goal];
}

/* ---------- AI generators (via edge function) ---------- */

export interface StudyReview {
  questions: string[];
  explainPrompt: string;
}

export interface Briefing {
  news: { title: string; summary: string }[];
  deepDive: { title: string; summary: string };
}

async function callMorningAI<T>(payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("morning-ai", { body: payload });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function generateStudyReview(topic: string): Promise<StudyReview> {
  const t = topic.trim();
  if (!t) {
    return {
      questions: [
        "What is the core concept you studied yesterday?",
        "Where would you apply it in real life?",
        "What's a common mistake people make with it?",
      ],
      explainPrompt: "In 2–3 sentences, explain yesterday's topic to a curious friend.",
    };
  }
  try {
    return await callMorningAI<StudyReview>({ action: "study_questions", studyTopic: t });
  } catch (e) {
    console.error("study_questions failed, using fallback", e);
    return {
      questions: [
        `What is the core concept behind ${t}?`,
        `Name one example or use case where ${t} applies.`,
        `What's one common mistake or misconception about ${t}?`,
      ],
      explainPrompt: `In 2–3 sentences, explain ${t} as if teaching a curious friend.`,
    };
  }
}

export async function generateBriefing(interests: string): Promise<Briefing> {
  try {
    return await callMorningAI<Briefing>({ action: "briefing", interests });
  } catch (e) {
    console.error("briefing failed, using fallback", e);
    return {
      news: [
        { title: "Briefing unavailable", summary: "We couldn't load fresh headlines this morning. Try again in a moment." },
        { title: "Tip: stay informed lightly", summary: "A 3-minute read beats 30 minutes of doomscrolling." },
        { title: "Today's mindset", summary: "Focus on inputs you can act on, not noise." },
      ],
      deepDive: {
        title: "Why spaced repetition works",
        summary: "Reviewing right before you'd forget strengthens memory more than re-reading. 3 minutes today beats 30 next week.",
      },
    };
  }
}

export async function generateFocus(setup: RoutineSetup): Promise<string> {
  try {
    const { focus } = await callMorningAI<{ focus: string }>({
      action: "focus",
      studyTopic: setup.studyTopic,
      fitnessGoal: setup.fitnessGoal,
      interests: setup.interests,
      dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    });
    return focus;
  } catch (e) {
    console.error("focus failed, using fallback", e);
    return "Finish the hardest task before noon.";
  }
}

export const FITNESS_LABELS: Record<FitnessGoal, string> = {
  fat_loss: "Fat loss",
  muscle_gain: "Muscle gain",
  maintain: "Maintain",
  low_energy: "Low energy",
};
