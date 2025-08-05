import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
