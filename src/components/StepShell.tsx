import { ReactNode } from "react";

interface Props {
  step: number;
  total: number;
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export function StepShell({ step, total, eyebrow, title, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto w-full">
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold mb-8 leading-tight">{title}</h1>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
