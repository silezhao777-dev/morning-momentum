import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadSetup } from "@/lib/morning";

const quotes = [
  "Every morning is a fresh start, filled with endless possibilities.",
  "Your path is like the morning sun, shining ever brighter as the day goes on.",
  "Discover the inner strength in the quiet of the morning to soar through your day.",
  "Give your best to everything you face today. Small efforts build a great life.",
  "Transform your day by renewing your mind.",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morning OS — Start your day with structure" },
      { name: "description", content: "A guided morning routine for students. Move, review, fuel, brief, and focus — in under 20 minutes." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [hasSetup, setHasSetup] = useState(false);
  const [randomQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  );

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
          {randomQuote}
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
        <div><div className="font-semibold text-foreground mb-1">5 steps</div>Guided flow</div>
        <div><div className="font-semibold text-foreground mb-1">~15 min</div>Quick & focused</div>
        <div><div className="font-semibold text-foreground mb-1">Action first</div>No fluff</div>
      </div>
    </div>
  );
}
