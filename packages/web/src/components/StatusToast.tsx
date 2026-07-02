import { SalaryStatus } from "@/hooks/useSalaryFhe";

const styles = {
  working: "border-green/30 bg-white text-green-deep",
  done: "border-green/40 bg-white text-green-deep",
  error: "border-red-300 bg-white text-red-600",
} as const;

export function StatusToast({ status }: { status: SalaryStatus }) {
  if (status.phase === "idle" || !status.message) return null;

  const style = styles[status.phase as keyof typeof styles] ?? styles.working;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-[0_16px_40px_-18px_rgba(6,95,70,0.5)] ${style}`}
    >
      {status.phase === "working" && (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current/40 border-t-current" />
      )}
      {status.phase === "done" && <span className="shrink-0">&#10003;</span>}
      {status.phase === "error" && <span className="shrink-0">&#9888;</span>}
      <span className="break-words">{status.message}</span>
    </div>
  );
}
