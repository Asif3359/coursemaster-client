import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
}

export function Button({
  children,
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-md disabled:opacity-50";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    ghost: "bg-transparent hover:bg-slate-100",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-50",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

