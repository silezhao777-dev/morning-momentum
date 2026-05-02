import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface Props {
  step: number;
  total: number;
  eyebrow: string;
  title: string;
  children: ReactNode;
  onBack?: () => void;
}

export function StepShell({ step, total, eyebrow, title, children, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 mb-6 h-8">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-1" />
        )}
      </div>
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
