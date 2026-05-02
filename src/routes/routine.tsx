import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Coffee, Dumbbell, Newspaper, BookOpen, Sparkles, Sunrise, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepShell } from "@/components/StepShell";
import {
  Energy,
  Briefing,
  StudyReview,
  generateBreakfast,
  generateBriefing,
  generateFocus,
  generatePhysicalActivity,
  generateStudyReview,
  loadSetup,
  RoutineSetup,
} from "@/lib/morning";

export const Route = createFileRoute("/routine")({
  head: () => ({
    meta: [
      { title: "This morning — Morning OS" },
      { name: "description", content: "Your guided morning routine: wake, move, review, eat, brief, focus." },
    ],
  }),
  component: Routine,
});

const TOTAL = 6;

function Loading({ label }: { label: string }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-8 flex flex-col items-center justify-center gap-3 shadow-[var(--shadow-soft)]">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Routine() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<RoutineSetup | null>(null);
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [explanation, setExplanation] = useState("");

  const [review, setReview] = useState<StudyReview | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // guard StrictMode double-invoke
    startedRef.current = true;
    const s = loadSetup();
    if (!s) {
      navigate({ to: "/setup" });
      return;
    }
    setSetup(s);
    // Kick off all AI calls in parallel as soon as the routine loads.
    generateStudyReview(s.studyTopic, s.studyMaterial).then(setReview).catch(console.error);
    generateBriefing(s.interests).then(setBriefing).catch(console.error);
    generateFocus(s).then(setFocus).catch(console.error);
  }, [navigate]);

  const breakfast = setup ? generateBreakfast(setup.fitnessGoal) : [];
  const activity = setup && energy ? generatePhysicalActivity(energy, setup.fitnessGoal) : null;

  if (!setup) return null;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL + 1));
  const back = () => {
    if (step <= 1) {
      navigate({ to: "/setup" });
      return;
    }
    setStep((s) => Math.max(s - 1, 1));
  };

  /* ----- Step 1: Wake-up ----- */
  if (step === 1) {
    return (
      <StepShell step={1} total={TOTAL} eyebrow="Step 1 · Wake-up" title="Get out of bed." onBack={back}>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--color-sun)]/30 flex items-center justify-center mb-8" style={{ boxShadow: "var(--shadow-glow)" }}>
            <Sunrise className="w-12 h-12 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-xs">
            Stand up. Open a window. Drink a glass of water. Then tap below.
          </p>
        </div>
        <Button size="lg" className="w-full h-14 rounded-2xl text-base" onClick={next}>
          I'm up <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </StepShell>
    );
  }

  /* ----- Step 2: Physical ----- */
  if (step === 2) {
    return (
      <StepShell step={2} total={TOTAL} eyebrow="Step 2 · Move" title="How's your energy?" onBack={() => { if (energy) { setEnergy(null); } else { back(); } }}>
        {!energy ? (
          <div className="space-y-3">
            {(["good", "okay", "tired"] as Energy[]).map((e) => (
              <button
                key={e}
                onClick={() => setEnergy(e)}
                className="w-full h-16 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all text-left px-5 flex items-center justify-between shadow-[var(--shadow-soft)]"
              >
                <span className="font-medium capitalize">{e}</span>
                <span className="text-2xl">{e === "good" ? "⚡️" : e === "okay" ? "🙂" : "😴"}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-3xl bg-card border border-border p-6 shadow-[var(--shadow-soft)] flex-1">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
                <Dumbbell className="w-5 h-5 text-accent-foreground" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{activity?.duration}</p>
              <h2 className="text-2xl font-semibold mb-3">{activity?.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{activity?.detail}</p>
            </div>
            <Button size="lg" className="w-full h-14 rounded-2xl text-base mt-6" onClick={next}>
              Done <Check className="ml-2 w-4 h-4" />
            </Button>
          </>
        )}
      </StepShell>
    );
  }

  /* ----- Step 3: Study review ----- */
  if (step === 3) {
    return (
      <StepShell step={3} total={TOTAL} eyebrow="Step 3 · Review" title="Lock in yesterday's learning." onBack={back}>
        <div className="space-y-4 flex-1">
          {!review ? (
            <Loading label="Generating your questions..." />
          ) : (
            <>
              <div className="rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">3 quick questions</p>
                </div>
                <ol className="space-y-3">
                  {review.questions.map((q: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-primary font-semibold">{i + 1}.</span>
                      <span className="text-sm leading-relaxed">{q}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Explain in your own words</p>
                </div>
                <p className="text-sm mb-3 leading-relaxed">{review.explainPrompt}</p>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Type a couple sentences..."
                  className="rounded-xl resize-none border-border"
                  rows={4}
                />
              </div>
            </>
          )}
        </div>
        <Button size="lg" className="w-full h-14 rounded-2xl text-base mt-6" onClick={next} disabled={!review}>
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </StepShell>
    );
  }

  /* ----- Step 4: Breakfast ----- */
  if (step === 4) {
    return (
      <StepShell step={4} total={TOTAL} eyebrow="Step 4 · Fuel" title="Pick your breakfast." onBack={back}>
        <div className="space-y-3 flex-1">
          {breakfast.map((b, i) => (
            <div key={i} className="rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">{b.title}</h3>
                </div>
                <span className="text-xs text-muted-foreground">{b.time}</span>
              </div>
              <ul className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/60" /> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Button size="lg" className="w-full h-14 rounded-2xl text-base mt-6" onClick={next}>
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </StepShell>
    );
  }

  /* ----- Step 5: Briefing ----- */
  if (step === 5) {
    return (
      <StepShell step={5} total={TOTAL} eyebrow="Step 5 · Briefing" title="The world, in 3 minutes." onBack={back}>
        <div className="space-y-3 flex-1">
          {!briefing ? (
            <Loading label="Curating your briefing..." />
          ) : (
            <>
              <div className="rounded-3xl bg-card border border-border p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-4 h-4 text-primary" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Headlines</p>
                </div>
                <div className="space-y-4">
                  {briefing.news.map((n, i) => (
                    <div key={i}>
                      <h4 className="font-medium text-sm mb-1">{n.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-accent/40 border border-accent p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Deep dive</p>
                <h4 className="font-semibold mb-1.5">{briefing.deepDive.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{briefing.deepDive.summary}</p>
              </div>
            </>
          )}
        </div>
        <Button size="lg" className="w-full h-14 rounded-2xl text-base mt-6" onClick={next} disabled={!briefing}>
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </StepShell>
    );
  }

  /* ----- Step 6: Daily focus ----- */
  if (step === 6) {
    return (
      <StepShell step={6} total={TOTAL} eyebrow="Step 6 · Focus" title="Today's priority." onBack={back}>
        <div className="flex-1 flex flex-col justify-center">
          {!focus ? (
            <Loading label="Crafting today's focus..." />
          ) : (
            <div className="rounded-3xl p-8 text-center" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-soft)" }}>
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-5" />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Today's priority</p>
              <p className="font-display text-2xl leading-snug">{focus}</p>
            </div>
          )}
        </div>
        <Button size="lg" className="w-full h-14 rounded-2xl text-base mt-6" onClick={next} disabled={!focus}>
          Start the day <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </StepShell>
    );
  }

  /* ----- Done ----- */
  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
          <Check className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-semibold mb-4">You're ready.</h1>
        <p className="text-muted-foreground max-w-xs mb-12">
          Routine complete. Go own the day.
        </p>
        <Button variant="outline" className="rounded-2xl" onClick={() => navigate({ to: "/" })}>
          Back home
        </Button>
      </div>
    </div>
  );
}
