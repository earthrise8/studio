"use client";

import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "destructive";
};

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  className,
  children,
  variant = "primary",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  const ringColor = {
    primary: "text-primary",
    secondary: "text-secondary-foreground",
    accent: "text-accent",
    destructive: "text-destructive",
  }[variant];


  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm p-6",
        className
      )}
      style={{ width: size + strokeWidth, height: size + strokeWidth }}
    >
      <svg
        className="absolute -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-muted"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-500 ease-out", ringColor)}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: isNaN(offset) ? circumference : offset,
          }}
        />
      </svg>
      <div className="z-10 text-center">
        {children}
      </div>
    </div>
  );
}
