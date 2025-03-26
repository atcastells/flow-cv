
import { cn } from "@/lib/utils";
import React from "react";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  className,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full py-1 px-3 text-sm font-medium transition-all",
        "hover:scale-105 active:scale-100",
        variant === "primary" 
          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className
      )}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </button>
  );
};

export default ActionButton;
