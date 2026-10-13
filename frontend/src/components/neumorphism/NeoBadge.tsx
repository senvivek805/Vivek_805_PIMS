import { ReactNode } from "react";

interface NeoBadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "info";
  size?: "sm" | "md";
  className?: string;
}

const variantMap = {
  primary: {
    color: "#4f6df5",
    bg: "rgba(79, 109, 245, 0.1)",
  },
  success: {
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  danger: {
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
  neutral: {
    color: "#64748b",
    bg: "rgba(100, 116, 139, 0.1)",
  },
  info: {
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.1)",
  },
};

const sizeMap = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-3 py-1",
};

export function NeoBadge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: NeoBadgeProps) {
  const { color, bg } = variantMap[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeMap[size]} ${className}`}
      style={{
        color,
        background: bg,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </span>
  );
}

export default NeoBadge;