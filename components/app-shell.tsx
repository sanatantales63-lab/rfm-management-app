"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, ChevronDown, CircleHelp, FileText, LayoutDashboard, Menu, Moon, Plus, Search, Settings, Sun, UserPlus, UsersRound, WandSparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: UsersRound },
  { label: "Create Client", href: "/create-client", icon: UserPlus },
  { label: "Invitations", href: "/invitations", icon: WandSparkles },
  { label: "Proposals", href: "/proposals", icon: FileText },
  { label: "RSVP", href: "/rsvp", icon: CalendarDays },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[242px] flex-col border-r bg-[hsl(var(--background))] px-4 py-5 transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <Brand />
        <div className="mt-10 space-y-1">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              onClick={() => setOpen(false)}
              key={href}
              href={href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                path === href || (href !== "/dashboard" && path.startsWith(href))
                  ? "bg-ink text-white shadow-glow dark:bg-champagne dark:text-ink"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <Icon size={17} />{label}
            </Link>
          ))}
        </div>
        <div className="mt-auto space-y-1 border-t pt-4">
          <Link href="/settings" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
            <Settings size={17} />Settings
          </Link>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
          >
            {/* Only render icon after mount to prevent hydration mismatch */}
            {mounted ? (resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />) : <Moon size={17} />}
            Appearance
          </button>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[hsl(var(--muted))] p-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-champagne text-xs font-bold text-white">RM</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Rohan Mehta</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Photographer</p>
            </div>
            <ChevronDown size={14} />
          </div>
        </div>
      </aside>

      {open && <button aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-ink/25 lg:hidden" />}

      <main className="min-w-0 lg:ml-[242px]">
        <header className="sticky top-0 z-20 flex h-[70px] w-full items-center gap-3 border-b bg-[hsl(var(--background))]/85 px-5 backdrop-blur-xl lg:px-8">
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[hsl(var(--muted))] lg:hidden" onClick={() => setOpen(true)}>
            <Menu size={19} />
          </button>
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
            <input placeholder="Search clients, invitations..." className="h-10 w-full rounded-xl bg-[hsl(var(--muted))] pl-9 pr-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="relative grid h-10 w-10 place-items-center rounded-xl hover:bg-[hsl(var(--muted))]">
              <Bell size={18} />
              <i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-champagne" />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[hsl(var(--muted))]">
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
