import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn("h-10 w-full rounded-xl border bg-transparent px-3.5 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))] focus:border-champagne focus:ring-2 focus:ring-champagne/15", className)} {...props} />; }
