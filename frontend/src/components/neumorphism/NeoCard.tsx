import { ReactNode, HTMLAttributes } from "react";

interface NeoCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "raised" | "inset" | "flat";
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  className?: string;
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variantMap = {
  raised: {
    background: "#e0e5ec",
    boxShadow: "20px 20px 60px #b8bcc2, -20px -20px 60px #ffffff",
  },
  inset: {
    background: "#e0e5ec",
    boxShadow: "inset 5px 5px 10px #b8bcc2, inset -5px -5px 10px #ffffff",
  },
  flat: {
    background: "#e0e5ec",
    boxShadow: "8px 8px 16px #b8bcc2, -8px -8px 16px #ffffff",
  },
};

export function NeoCard({
  children,
  variant = "raised",
  padding = "md",
  hover = false,
  className = "",
  ...props
}: NeoCardProps) {
  return (
    <div
      className={`rounded-[24px] ${paddingMap[padding]} ${className} ${
        hover ? "transition-all duration-300 hover:-translate-y-1" : ""
      }`}
      style={{
        ...variantMap[variant],
        ...(hover && {
          cursor: "pointer",
        }),
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default NeoCard;