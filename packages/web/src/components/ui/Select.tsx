import type { IconName } from "@/components/icons/Icon";
import { Icon } from "@/components/icons/Icon";

interface SelectProps {
  label: string;
  value: number;
  options: readonly string[];
  onChange: (value: number) => void;
  icon?: IconName;
}

export function Select({ label, value, options, onChange, icon }: SelectProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon && <Icon name={icon} size={14} className="text-green-deep" />}
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none rounded-2xl border border-green/15 bg-green/5 px-4 py-3.5 text-sm font-medium text-ink outline-none transition-colors focus:border-green/60 focus:bg-green/10"
        >
          {options.map((option, id) => (
            <option key={option} value={id}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-green-deep/50">
          &#9662;
        </span>
      </div>
    </label>
  );
}
