"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Eye, ExternalLink, Search, Users, Key, ChevronRight, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { mapSupabaseClient } from "@/services/clients";
import { fetchAllSupabaseRsvps, deleteRsvpById } from "@/services/rsvps";
import type { Client, Rsvp } from "@/types";

/* ── RSVP reads invitation clients from 'registrations' table ── */
async function getInvitationClients(): Promise<Client[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const db = createClient();
    const { data, error } = await db.from("registrations").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapSupabaseClient);
  } catch { return []; }
}

async function deleteInvitationRecord(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const db = createClient();
    await db.from("rsvps").delete().eq("client_id", String(id));
    await db.from("registrations").delete().eq("id", id);
    return true;
  } catch { return false; }
}

/* ─── helpers ─── */

/** Build every possible slug/ID variant for a client so we can match rsvp.client_id */
function clientMatchKeys(c: Client): string[] {
  const keys: string[] = [
    String(c.id).toLowerCase().trim(),
    (c.portalCode || "").toLowerCase().trim(),
  ];
  const bride = (c.brideName || "").split(" ")[0].toLowerCase().trim();
  const groom = (c.groomName || "").split(" ")[0].toLowerCase().trim();
  if (bride && groom) {
    keys.push(`${bride}-${groom}`);
    keys.push(`${groom}-${bride}`);
    keys.push(`reg-${c.id}`); // matches "reg-<timestamp>" format
  }
  return keys.filter(Boolean);
}

/** Does rsvp.clientId match this client? */
function rsvpMatchesClient(r: Rsvp, c: Client): boolean {
  if (!r.clientId) return false;
  const rid = r.clientId.toLowerCase().trim();
  const matchKeys = clientMatchKeys(c);
  if (matchKeys.some((k) => k === rid)) return true;

  // Partial slug match (e.g. slug "rupali-raghav" in "reg-rupali-raghav")
  const bride = (c.brideName || "").split(" ")[0].toLowerCase().trim();
  const groom = (c.groomName || "").split(" ")[0].toLowerCase().trim();
  if (bride && groom) {
    if (rid.includes(bride) && rid.includes(groom)) return true;
  }
  return false;
}

/* ─── Component ─── */
export function RsvpDashboard({ clientId: propClientId }: { clientId?: string }) {
  const searchParams = useSearchParams();
  const activeClientId = propClientId || searchParams.get("client");

  const [query, setQuery] = useState("");
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

  /* ── Fetch RSVPs from Supabase only ── */
  const fetchRsvps = useCallback(async () => {
    const supaRsvps = await fetchAllSupabaseRsvps();
    if (mountedRef.current) setRsvps(supaRsvps);
  }, []);

  /* ── Fetch clients from Supabase only ── */
  const fetchClients = useCallback(async () => {
    const supaClients = await getInvitationClients();
    if (mountedRef.current) {
      setAllClients(supaClients);
      setLoading(false);
    }
  }, []);

  /* ── Initial load & realtime subscription ── */
  useEffect(() => {
    mountedRef.current = true;
    Promise.all([fetchClients(), fetchRsvps()]);

    // Realtime subscription for rsvps table
    if (isSupabaseConfigured()) {
      try {
        const db = createClient();
        const channel = db
          .channel(`rsvp-dashboard-${Date.now()}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "rsvps" },
            () => { fetchRsvps(); }
          )
          .subscribe((status: string) => {
            if (status === "SUBSCRIBED") {
              console.log("✅ Realtime RSVP subscription active");
            }
          });
        channelRef.current = channel;
      } catch (e) {
        console.warn("Realtime subscription failed:", e);
      }
    }

    // Poll every 5 seconds as backup
    const pollInterval = setInterval(fetchRsvps, 5000);

    return () => {
      mountedRef.current = false;
      clearInterval(pollInterval);
      if (channelRef.current) {
        try {
          const db = createClient();
          db.removeChannel(channelRef.current);
        } catch {}
        channelRef.current = null;
      }
    };
  }, [fetchClients, fetchRsvps]);

  /* ── Delete guest RSVP ── */
  const handleDeleteGuest = async (id: string, name: string) => {
    if (!confirm(`Delete RSVP for ${name}?`)) return;
    try {
      await deleteRsvpById(id);
      setRsvps((prev) => prev.filter((r) => r.id !== id));
      toast.success(`${name}'s RSVP deleted`);
    } catch {
      toast.error("Failed to delete guest response");
    }
  };

  /* ── Delete client card ── */
  const handleDeleteClientCard = async (e: React.MouseEvent, c: Client) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete ${c.clientName}? This will remove them from RSVP and Invitations.`)) return;

    try {
      await deleteInvitationRecord(String(c.id));
      setAllClients((prev) => prev.filter((item) => String(item.id) !== String(c.id)));
      // Also remove associated RSVPs from state
      setRsvps((prev) => prev.filter((r) => !rsvpMatchesClient(r, c)));
      toast.success("Deleted from RSVP & Invitations");
    } catch {
      toast.error("Failed to delete card");
    }
  };

  /* ── Derived data ── */
  const selectedClient = activeClientId
    ? allClients.find((c) => String(c.id) === activeClientId) ?? null
    : null;

  const clientRsvps = useMemo(() => {
    if (!selectedClient) return [];
    return rsvps.filter((r) => rsvpMatchesClient(r, selectedClient));
  }, [selectedClient, rsvps]);

  const guests = useMemo(
    () =>
      clientRsvps.filter((x) =>
        x.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, clientRsvps]
  );

  const coming = clientRsvps.filter((x) => x.attending);
  const totalMembers = clientRsvps.reduce((a, x) => a + x.members, 0);
  const comingCount = coming.reduce((a, x) => a + x.members, 0);
  const vegCount = coming
    .filter((x) => x.food === "Veg")
    .reduce((a, x) => a + x.members, 0);
  const nonVegCount = coming
    .filter((x) => x.food === "Non Veg")
    .reduce((a, x) => a + x.members, 0);
  const confirmRate =
    totalMembers > 0 ? Math.round((comingCount / totalMembers) * 100) : 0;

  const allEvents = Array.from(new Set(clientRsvps.flatMap((r) => r.events)));

  const getViewLink = (c: Client) =>
    `${typeof window !== "undefined" ? window.location.origin : ""}/rsvp-view/${c.portalCode}`;

  const getPublicRsvpLink = (c: Client) => {
    const bride = (c.brideName || "").split(" ")[0].toLowerCase();
    const groom = (c.groomName || "").split(" ")[0].toLowerCase();
    const slug =
      bride && groom ? `${bride}-${groom}` : String(c.id);
    return `${typeof window !== "undefined" ? window.location.origin : ""}/rsvp/${slug}`;
  };

  /* ─── LIST VIEW (no client selected) ─── */
  if (!selectedClient) {
    return (
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Guest experience</p>
            <h1 className="mt-1 font-display text-3xl">RSVP</h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Select a client to view their guest responses
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchClients();
              fetchRsvps();
              toast.success("Refreshed");
            }}
          >
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="mt-8 surface p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Loading clients...
          </div>
        ) : allClients.length === 0 ? (
          <div className="mt-8 surface p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">
            <p className="font-semibold text-base text-[hsl(var(--foreground))]">
              No RSVP clients found
            </p>
            <p className="mt-1">
              Create an invitation or client to view responses here.
            </p>
            <Link href="/invitations/new" className="mt-4 inline-block">
              <Button size="sm">Create invitation</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {allClients.map((c) => {
              const cRsvps = rsvps.filter((r) => rsvpMatchesClient(r, c));
              const cComing = cRsvps
                .filter((r) => r.attending)
                .reduce((a, r) => a + r.members, 0);
              const cTotal = cRsvps.reduce((a, r) => a + r.members, 0);

              return (
                <div key={String(c.id)} className="relative group">
                  <Link href={`/rsvp?client=${c.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="surface cursor-pointer p-5 transition hover:border-champagne/40 pr-12"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9d6c1] text-sm font-bold text-[#795636]">
                          {c.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{c.clientName}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                            {c.location}
                          </p>
                        </div>
                        <ChevronRight
                          size={17}
                          className="text-[hsl(var(--muted-foreground))]"
                        />
                      </div>
                      <div className="mt-4 flex gap-4 border-t pt-4">
                        <div>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            Total guests
                          </p>
                          <p className="text-xl font-semibold">{cTotal}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            Coming
                          </p>
                          <p className="text-xl font-semibold text-emerald-600">
                            {cComing}
                          </p>
                        </div>
                        <div className="ml-auto flex items-end">
                          <Badge
                            tone={
                              c.status === "confirmed" ? "success" : "gold"
                            }
                          >
                            {c.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClientCard(e, c)}
                    title="Delete RSVP card & invitation"
                    className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-stone-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ─── DETAIL VIEW (client selected) ─── */
  const brideName = (selectedClient.brideName || "Bride").split(" ")[0];
  const groomName = (selectedClient.groomName || "Groom").split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-8">
      <Link
        href="/rsvp"
        className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
      >
        ← All clients
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Guest experience</p>
          <h1 className="mt-1 font-display text-3xl">RSVP</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            {brideName} & {groomName} · response overview
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchRsvps();
              toast.success("Refreshed");
            }}
          >
            <RefreshCw size={14} />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(getPublicRsvpLink(selectedClient));
              toast.success("Guest RSVP link copied!", {
                description:
                  "Share with guests so they can fill their response",
              });
            }}
          >
            <Copy size={16} />Copy RSVP link
          </Button>
          <Link
            href={`/rsvp/${brideName.toLowerCase()}-${groomName.toLowerCase()}`}
          >
            <Button>
              <ExternalLink size={16} />Preview page
            </Button>
          </Link>
        </div>
      </div>

      {/* Private view banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-champagne/20 bg-champagne/5 p-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne/10 text-champagne">
          <Key size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {brideName} & {groomName}'s private view
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            Share this link with the couple — they see only their own guest list
            (read-only, no login needed)
          </p>
          <p className="mt-1 font-mono text-[10px] text-champagne truncate">
            {getViewLink(selectedClient)}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(getViewLink(selectedClient));
              toast.success("Client view link copied!");
            }}
          >
            <Copy size={14} />Copy link
          </Button>
          <Link href={`/rsvp-view/${selectedClient.portalCode}`}>
            <Button size="sm" variant="outline">
              <Eye size={14} />Preview
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total invited",
            value: totalMembers,
            sub: "Across all events",
            hi: false,
          },
          {
            label: "Coming",
            value: comingCount,
            sub: `${confirmRate}% confirmed`,
            hi: true,
          },
          { label: "Vegetarian", value: vegCount, sub: "Guest meals", hi: false },
          {
            label: "Non vegetarian",
            value: nonVegCount,
            sub: "Guest meals",
            hi: false,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="surface p-5"
          >
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">{s.value}</p>
            <p
              className={`mt-3 text-xs font-medium ${
                s.hi
                  ? "text-emerald-600"
                  : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {s.sub}
            </p>
          </motion.div>
        ))}
      </section>

      {/* Guest table */}
      <section className="surface mt-6 overflow-hidden">
        <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Attendance</p>
            <h2 className="mt-1 text-lg font-semibold">Guest responses</h2>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guests"
              className="pl-9"
            />
          </div>
        </div>

        {guests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users
              size={40}
              className="text-[hsl(var(--muted-foreground))] opacity-30"
            />
            <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
              No guests yet. Share the RSVP link to get responses.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence>
              {guests.map((g) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 p-4 md:px-6"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-champagne/10 text-xs font-bold text-champagne">
                    {g.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{g.name}</p>
                    <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      {g.phone} · {g.members}{" "}
                      {g.members === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Events
                    </p>
                    <p className="mt-1 text-sm">{g.events.join(", ") || "—"}</p>
                  </div>
                  <div className="hidden w-20 sm:block">
                    <Badge tone={g.food === "Veg" ? "success" : "gold"}>
                      {g.food}
                    </Badge>
                  </div>
                  <Badge tone={g.attending ? "success" : "neutral"}>
                    {g.attending ? "Coming" : "Declined"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleDeleteGuest(g.id, g.name)}
                    title="Delete guest RSVP"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Event breakdown */}
      {allEvents.length > 0 && (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {allEvents.map((event) => {
            const yes = clientRsvps
              .filter((r) => r.attending && r.events.includes(event))
              .reduce((a, r) => a + r.members, 0);
            const pct =
              totalMembers > 0
                ? Math.round((yes / totalMembers) * 100)
                : 0;
            return (
              <div key={event} className="surface p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Event attendance</p>
                    <h2 className="mt-1 font-semibold">{event}</h2>
                  </div>
                  <Users className="text-champagne" size={20} />
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                  <motion.div
                    className="h-full rounded-full bg-champagne"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <p className="mt-3 text-sm">
                  <b>{yes}</b>{" "}
                  <span className="text-[hsl(var(--muted-foreground))]">
                    of {totalMembers} guests are coming
                  </span>
                </p>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
