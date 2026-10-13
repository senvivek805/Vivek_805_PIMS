"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  className?: string;
}

export const NeoInput = forwardRef<HTMLInputElement, NeoInputProps>(
  ({ label, icon, rightIcon, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-slate-700 font-medium text-xs pl-2 block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full h-11 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 placeholder:text-slate-400 border-0 outline-none ${
              icon ? "pl-10" : "pl-4"
            } ${rightIcon ? "pr-10" : "pr-4"} ${className}`}
            style={{
              boxShadow: error
                ? "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff, 0 0 0 2px #ef4444"
                : "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 pl-2">{error}</p>
        )}
      </div>
    );
  }
);

NeoInput.displayName = "NeoInput";

export default NeoInput;