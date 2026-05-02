export type FitnessGoal = "fat_loss" | "muscle_gain" | "maintain" | "low_energy";
export type Energy = "good" | "okay" | "tired";

export interface RoutineSetup {
  wakeTime: string;
  studyTopic: string;
  fitnessGoal: FitnessGoal;
}

export const STORAGE_KEY = "morning-os-setup";

export function loadSetup(): RoutineSetup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSetup(s: RoutineSetup) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/* ---------- Generators (mock AI) ---------- */

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

export function generateStudyReview(topic: string) {
  const t = topic.trim() || "yesterday's material";
  return {
    questions: [
      `What is the core concept behind ${t}?`,
      `Name one example or use case where ${t} applies.`,
      `What's one common mistake or misconception about ${t}?`,
    ],
    explainPrompt: `In 2–3 sentences, explain ${t} as if teaching a curious friend.`,
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

export function generateBriefing() {
  return {
    news: [
      { title: "Markets edge higher on tech earnings", summary: "Major indices closed up as cloud and AI firms beat expectations." },
      { title: "New language model benchmark released", summary: "A consortium published an open eval covering reasoning, code, and math." },
      { title: "EU finalizes AI safety framework", summary: "Regulators agreed on disclosure rules for general-purpose models." },
    ],
    deepDive: {
      title: "Why spaced repetition works",
      summary: "Reviewing material right before you'd forget it strengthens memory more than re-reading. Even 3 minutes today beats 30 next week.",
    },
  };
}

const FOCUSES = [
  "Finish the hardest task before noon.",
  "Protect 90 minutes of deep work — no phone.",
  "Review notes from your weakest subject.",
  "Send the message you've been putting off.",
  "Move your body for 20 minutes.",
];

export function generateFocus() {
  return FOCUSES[Math.floor(Math.random() * FOCUSES.length)];
}

export const FITNESS_LABELS: Record<FitnessGoal, string> = {
  fat_loss: "Fat loss",
  muscle_gain: "Muscle gain",
  maintain: "Maintain",
  low_energy: "Low energy",
};
