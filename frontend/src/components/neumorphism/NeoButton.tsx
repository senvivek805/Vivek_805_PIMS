"use client";

import { ButtonHTMLAttributes, ReactNode, useState } from "react";
import { Loader2 } from "lucide-react";

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
}

const variantColors = {
  primary: {
    base: "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
    hover: "linear-gradient(135deg, #6366f1 0%, #4f6df5 100%)",
  },
  success: {
    base: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    hover: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  },
  danger: {
    base: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    hover: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
  },
  secondary: {
    base: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
    hover: "linear-gradient(135deg, #475569 0%, #64748b 100%)",
  },
};

const sizeMap = {
  sm: "h-9 text-xs px-4",
  md: "h-11 text-sm px-6",
  lg: "h-14 text-base px-8",
};

export function NeoButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  className = "",
  disabled,
  ...props
}: NeoButtonProps) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled || loading}
      className={`rounded-xl text-white font-bold flex items-center justify-center gap-2 ${
        sizeMap[size]
      } ${fullWidth ? "w-full" : ""} ${className} ${
        disabled || loading ? "opacity-60 cursor-not-allowed" : ""
      }`}
      style={{
        background: hover && !disabled && !loading
          ? variantColors[variant].hover
          : variantColors[variant].base,
        boxShadow:
          hover && !disabled && !loading
            ? "8px 8px 18px #b8bcc2, -8px -8px 18px #ffffff, inset 0 1px 0 rgba(255,255,255,0.3)"
            : "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff, inset 0 1px 0 rgba(255,255,255,0.2)",
        transform: hover && !disabled && !loading ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

export default NeoButton;