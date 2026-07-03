import { Icon, type IconName } from "@/components/icons/Icon";

type BadgeSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<BadgeSize, { box: string; icon: number }> = {
  sm: { box: "h-9 w-9 rounded-xl", icon: 18 },
  md: { box: "h-10 w-10 rounded-2xl", icon: 20 },
  lg: { box: "h-12 w-12 rounded-2xl", icon: 24 },
};

interface IconBadgeProps {
  name: IconName;
  size?: BadgeSize;
  className?: string;
}

export function IconBadge({ name, size = "md", className = "" }: IconBadgeProps) {
  const { box, icon } = SIZE_MAP[size];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-green to-green-deep text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.55)] ${box} ${className}`}
    >
      <Icon name={name} size={icon} />
    </span>
  );
}
