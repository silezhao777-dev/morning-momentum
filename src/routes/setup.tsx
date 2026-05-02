import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FITNESS_LABELS, FitnessGoal, loadSetup, saveSetup } from "@/lib/morning";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Setup — Morning OS" },
      { name: "description", content: "Tell Morning OS your wake-up time, what you studied, and your fitness goal." },
    ],
  }),
  component: Setup,
});

function Setup() {
  const navigate = useNavigate();
  const [wakeTime, setWakeTime] = useState("07:00");
  const [studyTopic, setStudyTopic] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("maintain");
  const [interests, setInterests] = useState("");

  useEffect(() => {
    const s = loadSetup();
    if (s) {
      setWakeTime(s.wakeTime);
      setStudyTopic(s.studyTopic);
      setFitnessGoal(s.fitnessGoal);
      setInterests(s.interests || "");
    }
  }, []);

  const submit = () => {
    saveSetup({ wakeTime, studyTopic, fitnessGoal, interests });
    navigate({ to: "/routine" });
  };

  const goals: FitnessGoal[] = ["fat_loss", "muscle_gain", "maintain", "low_energy"];

  return (
    <div className="min-h-screen px-6 py-10 max-w-md mx-auto w-full">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Setup</p>
      <h1 className="text-3xl font-semibold mb-2 leading-tight">Tell us about tomorrow.</h1>
      <p className="text-muted-foreground mb-10">Three quick inputs. We'll build your morning.</p>

      <div className="space-y-7">
        <div>
          <Label htmlFor="wake" className="mb-2 block">Wake-up time</Label>
          <Input id="wake" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="h-12 rounded-xl" />
        </div>

        <div>
          <Label htmlFor="topic" className="mb-2 block">What did you study yesterday?</Label>
          <Textarea
            id="topic"
            placeholder="e.g. Linear algebra — eigenvalues and eigenvectors"
            value={studyTopic}
            onChange={(e) => setStudyTopic(e.target.value)}
            className="rounded-xl resize-none"
            rows={3}
          />
        </div>

        <div>
          <Label className="mb-3 block">Fitness goal</Label>
          <div className="grid grid-cols-2 gap-2">
            {goals.map((g) => (
              <button
                key={g}
                onClick={() => setFitnessGoal(g)}
                className={`h-12 rounded-xl border text-sm font-medium transition-all ${
                  fitnessGoal === g
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                {FITNESS_LABELS[g]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={submit} size="lg" className="w-full h-14 text-base rounded-2xl mt-12">
        Save & continue
      </Button>
    </div>
  );
}
