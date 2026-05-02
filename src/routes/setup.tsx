import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FITNESS_LABELS, FitnessGoal, loadSetup, saveSetup } from "@/lib/morning";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Setup — Morning OS" },
      { name: "description", content: "Tell Morning OS what you studied yesterday and your fitness goal." },
    ],
  }),
  component: Setup,
});

const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_EXTRACTED_CHARS = 12000;

async function extractPdfText(file: File): Promise<string> {
  // Lazy-load pdfjs only in the browser to avoid SSR issues.
  const pdfjs: any = await import("pdfjs-dist");
  // @ts-ignore - vite worker import
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ");
    text += pageText + "\n\n";
    if (text.length > MAX_EXTRACTED_CHARS) break;
  }
  return text.trim().slice(0, MAX_EXTRACTED_CHARS);
}

function Setup() {
  const navigate = useNavigate();
  const [studyTopic, setStudyTopic] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("maintain");
  const [interests, setInterests] = useState("");
  const [studyMaterial, setStudyMaterial] = useState("");
  const [studyMaterialName, setStudyMaterialName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = loadSetup();
    if (s) {
      setStudyTopic(s.studyTopic);
      setFitnessGoal(s.fitnessGoal);
      setInterests(s.interests || "");
      setStudyMaterial(s.studyMaterial || "");
      setStudyMaterialName(s.studyMaterialName || "");
    }
  }, []);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setParseError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setParseError("Please upload a PDF file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setParseError("PDF is too large (max 10 MB).");
      return;
    }
    setParsing(true);
    try {
      const text = await extractPdfText(file);
      if (!text) {
        setParseError("Couldn't read text from this PDF (it may be scanned images).");
      } else {
        setStudyMaterial(text);
        setStudyMaterialName(file.name);
      }
    } catch (err) {
      console.error(err);
      setParseError("Failed to read PDF.");
    } finally {
      setParsing(false);
    }
  };

  const clearMaterial = () => {
    setStudyMaterial("");
    setStudyMaterialName("");
    setParseError(null);
  };

  const submit = () => {
    saveSetup({ studyTopic, fitnessGoal, interests, studyMaterial, studyMaterialName });
    navigate({ to: "/routine" });
  };

  const goals: FitnessGoal[] = ["fat_loss", "muscle_gain", "maintain", "low_energy"];

  return (
    <div className="min-h-screen px-6 py-10 max-w-md mx-auto w-full">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Setup</p>
      <h1 className="text-3xl font-semibold mb-2 leading-tight">Tell us about tomorrow.</h1>
      <p className="text-muted-foreground mb-10">A few quick inputs. We'll build your morning.</p>

      <div className="space-y-7">
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

          <div className="mt-3">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={onPickFile}
            />
            {!studyMaterialName ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={parsing}
                className="w-full rounded-xl border border-dashed border-border bg-card hover:border-primary/50 transition-all px-4 py-5 flex flex-col items-center justify-center gap-2 disabled:opacity-60"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Reading your PDF…</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Upload yesterday's material (PDF)</span>
                    <span className="text-xs text-muted-foreground">Optional · max 10 MB</span>
                  </>
                )}
              </button>
            ) : (
              <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{studyMaterialName}</p>
                  <p className="text-xs text-muted-foreground">
                    {studyMaterial.length.toLocaleString()} chars extracted
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearMaterial}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}
            {parseError && <p className="text-xs text-destructive mt-2">{parseError}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              We'll use the material to generate sharper review questions.
            </p>
          </div>
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

        <div>
          <Label htmlFor="interests" className="mb-2 block">What topics do you care about?</Label>
          <Textarea
            id="interests"
            placeholder="e.g. AI research, climate tech, basketball, philosophy"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="rounded-xl resize-none"
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-2">Used for your morning briefing.</p>
        </div>
      </div>

      <Button onClick={submit} size="lg" className="w-full h-14 text-base rounded-2xl mt-12">
        Save & continue
      </Button>
    </div>
  );
}
