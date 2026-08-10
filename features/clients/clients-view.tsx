"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Check, ChevronRight, Copy, Filter, Plus, Search, Trash2, UserPlus, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteClientRecord, getClients } from "@/services/clients";
import type { Client } from "@/types";

const OWNER_TOKEN = "RFM2026";

export function ClientsView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const dbClients = await getClients();
      // Deduplicate by name
      const seen = new Set<string>();
      const deduplicated: Client[] = [];
      for (const c of dbClients) {
        const nameKey = (c.clientName || `${c.brideName} & ${c.groomName}`).toLowerCase().trim();
        if (seen.has(nameKey)) continue;
        seen.add(nameKey);
        deduplicated.push(c);
      }
      setClients(deduplicated);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, []);

  const handleDelete = async (e: React.MouseEvent, c: Client) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${c.clientName}?`)) return;

    setDeletingId(c.id);
    try {
      await deleteClientRecord(c.id);
      setClients(prev => prev.filter(item => item.id !== c.id));
      toast.success("Client deleted successfully");
    } catch {
      toast.error("Could not delete client");
    } finally {
      setDeletingId(null);
    }
  };

  const rows = useMemo(
    () => clients.filter(c =>
      (filter === "all" || c.status === filter) &&
      c.clientName.toLowerCase().includes(search.toLowerCase())
    ),
    [search, filter, clients]
  );

  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const ownerRegLink = `${origin || "http://localhost:3000"}/register/${OWNER_TOKEN}`;

  const copyOwnerLink = () => {
    navigator.clipboard.writeText(ownerRegLink).then(() => {
      setShowLinkCopied(true);
      setTimeout(() => setShowLinkCopied(false), 2500);
      toast.success("Registration link copied!", {
        description: "Share this with any new client — they'll fill their details and register into Supabase.",
      });
    });
  };

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Relationships</p>
          <h1 className="mt-1 font-display text-3xl">Clients</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Every couple, every detail, beautifully organized in Supabase.
          </p>
        </div>
      </div>

      {/* Self-registration link banner */}
      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-champagne/25 bg-gradient-to-r from-champagne/8 to-transparent p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne/15 text-champagne">
          <UserPlus size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">New client registration link</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Send this link to a new client — they fill their own details, dress code & preferences and{" "}
            <span className="font-semibold text-champagne">automatically save into your Supabase database</span>.
          </p>
          <p className="mt-1 font-mono text-[10px] text-champagne truncate">{ownerRegLink}</p>
        </div>
        <Button size="sm" onClick={copyOwnerLink}>
          {showLinkCopied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy link</>}
        </Button>
      </div>

      {/* Table */}
      <div className="surface mt-5 overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b p-4 sm:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
            <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Search couples..." />
          </div>
          <div className="flex gap-2">
            <Filter size={16} className="mt-3 text-[hsl(var(--muted-foreground))]" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="h-10 rounded-xl border bg-transparent px-3 text-sm outline-none"
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="planning">Planning</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[hsl(var(--muted-foreground))] flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-champagne" /> Loading client database...
          </div>
        ) : (
          <div className="divide-y">
            {rows.map(c => (
              <div key={c.id} className="group relative flex items-center justify-between p-4 transition hover:bg-[hsl(var(--muted))] sm:px-6">
                <Link
                  href={`/clients/${c.id}`}
                  className="flex flex-1 items-center gap-3 sm:gap-5 min-w-0 pr-4"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9d6c1] text-xs font-bold text-[#795636]">
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{c.clientName}</p>
                    </div>
                    <p className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">{c.location}</p>
                    {c.dressCode && (
                      <p className="mt-0.5 text-[10px] text-champagne">👔 {c.dressCode}</p>
                    )}
                  </div>
                  <div className="hidden w-36 sm:block">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Wedding date</p>
                    <p className="mt-1 text-sm font-medium">
                      {c.weddingDate ? new Date(c.weddingDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBD"}
                    </p>
                  </div>
                  <div className="hidden w-32 md:block">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Package</p>
                    <p className="mt-1 text-sm">{c.packageName}</p>
                  </div>
                  <Badge tone={c.status === "confirmed" ? "success" : "gold"}>{c.status}</Badge>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, c)}
                    disabled={deletingId === c.id}
                    title="Delete client"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-stone-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
                  >
                    {deletingId === c.id ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} />}
                  </button>
                  <Link href={`/clients/${c.id}`}>
                    <ChevronRight size={17} className="text-[hsl(var(--muted-foreground))] group-hover:text-champagne" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">
            <p className="font-semibold text-base text-[hsl(var(--foreground))]">No clients found</p>
            <p className="mt-1">Add a new client or share your registration link above to get started.</p>
            <Link href="/clients/new" className="mt-4 inline-block">
              <Button size="sm"><Plus size={14} /> Create client</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Calendar size={14} />Showing {rows.length} active client stories
      </div>
    </div>
  );
}
