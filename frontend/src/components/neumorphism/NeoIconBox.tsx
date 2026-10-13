import { ReactNode } from "react";

interface NeoIconBoxProps {
  children: ReactNode;
  variant?: "raised" | "inset";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "rounded" | "circle";
  color?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
};

const shapeMap = {
  rounded: "rounded-xl",
  circle: "rounded-full",
};

const variantMap = {
  raised: {
    background: "#e0e5ec",
    boxShadow: "6px 6px 12px #b8bcc2, -6px -6px 12px #ffffff",
  },
  inset: {
    background: "#e0e5ec",
    boxShadow: "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
  },
};

export function NeoIconBox({
  children,
  variant = "raised",
  size = "md",
  shape = "rounded",
  color = "text-blue-600",
  className = "",
}: NeoIconBoxProps) {
  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${sizeMap[size]} ${shapeMap[shape]} ${color} ${className}`}
      style={variantMap[variant]}
    >
      {children}
    </div>
  );
}

export default NeoIconBox;