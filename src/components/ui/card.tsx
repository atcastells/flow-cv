import React, { forwardRef } from 'react';

import { cn } from "@/lib/utils";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children, ...props }) => (
  <div className={`bg-card text-card-foreground rounded-lg border shadow-lg ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-3 sm:p-4 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children, ...props }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`} {...props}>
    {children}
  </h2>
);

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

export const CardContent = forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`p-3 sm:p-4 pt-0 ${className || ''}`} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children, ...props }) => (
  <div className={`flex items-center p-3 sm:p-4 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
);
