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
  const baseStyles =
    "px-4 py-2 rounded-md disabled:opacity-50 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-transparent text-indigo-700 hover:bg-indigo-50",
    outline:
      "border border-indigo-200 bg-transparent text-indigo-700 hover:bg-indigo-50",
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

