import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

// Badges are static text labels. Base styles are the .badge class in
// globals.css, which keeps the per-badge class attribute short.
const badgeVariants = cva("badge", {
  defaultVariants: { variant: "secondary" },
  variants: {
    variant: {
      outline: "border-input bg-background text-foreground dark:bg-input/32",
      secondary: "bg-secondary text-secondary-foreground",
    },
  },
});

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ className, variant }))} data-slot="badge" {...props} />;
}
