interface MoneyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function MoneyInput({ label, value, onChange }: MoneyInputProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        Annual salary
      </span>
      <div className="group relative flex items-center rounded-2xl border border-green/15 bg-green/5 transition-colors focus-within:border-green/60 focus-within:bg-green/10">
        <span className="pl-4 text-lg font-bold text-green-deep">$</span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="85000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-full bg-transparent px-3 py-3.5 text-lg font-bold text-ink outline-none placeholder:text-ink/25 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="pr-4 text-xs font-medium text-muted">USD / year</span>
      </div>
    </label>
  );
}
