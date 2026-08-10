"use client";
import { Copy, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ClientDetailActions({
  portalCode,
  showRegLink = false,
}: {
  portalCode: string;
  showRegLink?: boolean;
}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const baseOrigin = origin || "http://localhost:3000";
  const portalLink = `${baseOrigin}/client/${portalCode}`;
  const regLink = `${baseOrigin}/register/${portalCode}`;

  if (showRegLink) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-[hsl(var(--muted))] p-3">
          <span className="font-mono text-xs truncate flex-1 mr-2 text-[hsl(var(--muted-foreground))]">
            /register/{portalCode}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(regLink).then(() =>
                toast.success("Registration link copied!", {
                  description: "Share with your client — they can fill their own details directly.",
                })
              );
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-champagne text-white transition hover:bg-champagne/80"
          >
            <Copy size={13} />
          </button>
        </div>
        <a
          href={regLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-champagne/40 py-2 text-xs font-semibold text-champagne transition hover:bg-champagne/10"
        >
          <Link2 size={13} />Preview registration page
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(portalLink).then(() =>
          toast.success("Portal link copied!")
        );
      }}
      className="text-champagne hover:text-champagne/70 transition"
    >
      <Copy size={16} />
    </button>
  );
}
