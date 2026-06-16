import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, value, subtitle, className }) => {
  return (
    <div className={twMerge("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
      )}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: "green" | "yellow" | "red" | "gray" | "blue";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = "gray", className }) => {
  const toneMap: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    gray: "bg-slate-50 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  className,
  ...props
}) => {
  const base = "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-slate-800 shadow-sm",
    secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 shadow-sm",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  };

  return (
    <button
      {...props}
      className={twMerge(base, variants[variant], className)}
    />
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      {...props}
      className={twMerge(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
    />
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

export const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
  return (
    <select
      {...props}
      className={twMerge(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
    >
      {children}
    </select>
  );
};

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidth = "2xl",
}) => {
  if (!open) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-blue-600/40 p-4 transition-opacity animate-in fade-in duration-200">
      <div
        className={twMerge(
          "w-full rounded-2xl bg-white shadow-xl transform transition-all animate-in zoom-in-95 duration-200",
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Close modal"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="px-5 py-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 bg-slate-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
