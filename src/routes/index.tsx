import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSetup } from "@/lib/morning";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morning OS — Start your day with structure" },
      { name: "description", content: "An AI morning assistant for students. Wake up, review, move, and focus — in under 30 minutes." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [hasSetup, setHasSetup] = useState(false);

  useEffect(() => {
    setHasSetup(!!loadSetup());
  }, []);

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto w-full">
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-sun)]/30 flex items-center justify-center mb-8" style={{ boxShadow: "var(--shadow-glow)" }}>
          <Sun className="w-8 h-8 text-primary" />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Morning OS
        </p>
        <h1 className="text-5xl font-semibold leading-[1.05] mb-5">
          Start your day<br />on purpose.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12">
          A 20-minute guided morning routine for students. Wake up, review what you studied, move, eat, and focus.
        </p>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full h-14 text-base rounded-2xl"
            onClick={() => navigate({ to: hasSetup ? "/routine" : "/setup" })}
          >
            {hasSetup ? "Begin this morning" : "Set up my routine"}
          </Button>
          {hasSetup && (
            <Link to="/setup" className="block text-center text-sm text-muted-foreground hover:text-foreground py-2">
              Update setup
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground pt-8">
        <div><div className="font-semibold text-foreground mb-1">6 steps</div>Guided flow</div>
        <div><div className="font-semibold text-foreground mb-1">~20 min</div>Quick & focused</div>
        <div><div className="font-semibold text-foreground mb-1">Action first</div>No fluff</div>
      </div>
    </div>
  );
}
