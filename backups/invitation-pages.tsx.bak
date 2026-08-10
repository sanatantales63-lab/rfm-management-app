"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar, CalendarDays, Check, ChevronRight, Clock, Copy,
  ExternalLink, Globe, Heart, Instagram, MapPin, Minus, Music2,
  Palette, Phone, Plus, Send, Shirt, Sparkles, Eye, Trash2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import { mapSupabaseClient } from "@/services/clients";
import type { Client, InvitationTheme } from "@/types";

/* ── Invitation-specific helpers (read/write to 'registrations' table) ── */
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

async function saveInvitationToRegistrations(inv: {
  brideName: string; groomName: string; venue: string;
  dressCode?: string; weddingDate?: string; events: string[]; theme?: string;
}): Promise<Client | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const db = createClient();
    const slug = `${inv.brideName.trim().split(" ")[0].toLowerCase()}-${inv.groomName.trim().split(" ")[0].toLowerCase()}`;
    // Check if exists
    const { data: existing } = await db.from("registrations").select("*");
    const match = (existing || []).find((row: any) => {
      const bf = (row.bride_name || "").split(" ")[0].toLowerCase().trim();
      const gf = (row.groom_name || "").split(" ")[0].toLowerCase().trim();
      return (bf === slug.split("-")[0] && gf === slug.split("-")[1]) || (gf === slug.split("-")[0] && bf === slug.split("-")[1]);
    });
    if (match) {
      const { data } = await db.from("registrations").update({
        venue: inv.venue || match.venue,
        dress_code: inv.dressCode || match.dress_code,
        wedding_date: inv.weddingDate || match.wedding_date,
        events: inv.events.length > 0 ? inv.events : match.events,
      }).eq("id", match.id).select().single();
      return data ? mapSupabaseClient(data) : mapSupabaseClient(match);
    }
    const { data, error } = await db.from("registrations").insert([{
      bride_name: inv.brideName.trim(), groom_name: inv.groomName.trim(),
      email: `${slug}@rfm.app`, phone: "",
      wedding_date: inv.weddingDate || null, venue: inv.venue,
      city: "", dress_code: inv.dressCode || "",
      events: inv.events, owner_token: "RFM2026",
    }]).select().single();
    if (error) { console.error("saveInvitation error:", error.message); return null; }
    return data ? mapSupabaseClient(data) : null;
  } catch (e) { console.error("saveInvitation exception:", e); return null; }
}

async function getInvitationBySlug(slug: string): Promise<{ client: Client; rawRow: any } | null> {
  if (!isSupabaseConfigured()) return null;
  const parts = slug.toLowerCase().trim().split("-");
  if (parts.length < 2) return null;
  const [a, b] = parts;
  try {
    const db = createClient();
    const { data } = await db.from("registrations").select("*");
    if (!data) return null;
    const match = data.find((row: any) => {
      const bf = (row.bride_name || "").split(" ")[0].toLowerCase().trim();
      const gf = (row.groom_name || "").split(" ")[0].toLowerCase().trim();
      return (bf === a && gf === b) || (gf === a && bf === b);
    });
    return match ? { client: mapSupabaseClient(match), rawRow: match } : null;
  } catch { return null; }
}


/* ══════════════════════════════════════════════════════
   THEME SYSTEM
══════════════════════════════════════════════════════ */
export const THEMES: Record<InvitationTheme, {
  label: string;
  bg: string;
  accent: string;
  accentDark: string;
  text: string;
  subtext: string;
  cardBg: string;
  border: string;
  gradient: string;
  font: string;
  preview: string;
  emoji: string;
}> = {
  "royal-amber": {
    label: "Royal Amber",
    bg: "#120d07",
    accent: "#c9a96e",
    accentDark: "#a07843",
    text: "#fdf8f0",
    subtext: "rgba(253,248,240,0.55)",
    cardBg: "rgba(255,255,255,0.05)",
    border: "rgba(201,169,110,0.2)",
    gradient: "linear-gradient(135deg, #1e1208 0%, #2b1d0e 50%, #120d07 100%)",
    font: "'Cormorant Garamond', Georgia, serif",
    preview: "#2b1d0e",
    emoji: "🏵️",
  },
  "midnight-garden": {
    label: "Midnight Garden",
    bg: "#060f09",
    accent: "#5fcf80",
    accentDark: "#3a9e5a",
    text: "#f0fdf4",
    subtext: "rgba(240,253,244,0.55)",
    cardBg: "rgba(255,255,255,0.05)",
    border: "rgba(95,207,128,0.2)",
    gradient: "linear-gradient(135deg, #0d1a0f 0%, #122015 50%, #060f09 100%)",
    font: "'Cormorant Garamond', Georgia, serif",
    preview: "#0d1a0f",
    emoji: "🌿",
  },
  "modern-ivory": {
    label: "Modern Ivory",
    bg: "#faf8f4",
    accent: "#9b7a4d",
    accentDark: "#7a5c35",
    text: "#1a1714",
    subtext: "rgba(26,23,20,0.55)",
    cardBg: "rgba(255,255,255,0.8)",
    border: "rgba(155,122,77,0.2)",
    gradient: "linear-gradient(135deg, #fdf9f3 0%, #f5efe4 50%, #ede3d5 100%)",
    font: "'Cormorant Garamond', Georgia, serif",
    preview: "#f5efe4",
    emoji: "🕊️",
  },
  "blush-romance": {
    label: "Blush Romance",
    bg: "#14090f",
    accent: "#e88fac",
    accentDark: "#c46785",
    text: "#fff0f5",
    subtext: "rgba(255,240,245,0.55)",
    cardBg: "rgba(255,255,255,0.05)",
    border: "rgba(232,143,172,0.2)",
    gradient: "linear-gradient(135deg, #1a0f14 0%, #221118 50%, #14090f 100%)",
    font: "'Cormorant Garamond', Georgia, serif",
    preview: "#1a0f14",
    emoji: "🌸",
  },
};

/* ══════════════════════════════════════════════════════
   EVENT EMOJI MAP
══════════════════════════════════════════════════════ */
const EVENT_PRESETS = [
  { name: "Haldi",           emoji: "🌿" },
  { name: "Mehndi",          emoji: "🌸" },
  { name: "Sangeet",         emoji: "🎶" },
  { name: "Wedding",         emoji: "💍" },
  { name: "Reception",       emoji: "✨" },
  { name: "Engagement",      emoji: "💎" },
  { name: "Tilak",           emoji: "🏵️" },
  { name: "Bidai",           emoji: "🌺" },
];

function getEmojiForEvent(name: string): string {
  const preset = EVENT_PRESETS.find(p => p.name.toLowerCase() === name.toLowerCase().trim());
  return preset?.emoji ?? "🎊";
}

export interface InvitationEvent {
  id: string;
  name: string;
  emoji: string;
  date: string;   // ISO date e.g. "2026-11-22"
  time: string;   // e.g. "10:00 AM"
}

/* ══════════════════════════════════════════════════════
   ADMIN: Invitations List View (Supabase-only)
══════════════════════════════════════════════════════ */
export function InvitationsView() {
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = async () => {
    setLoading(true);
    const clients = await getInvitationClients();
    setAllClients(clients);
    setLoading(false);
  };

  useEffect(() => { loadInvitations(); }, []);

  const handleDeleteInvitation = async (id: string, title: string) => {
    if (!confirm(`Delete the invitation for ${title}? This will also remove it from RSVP and Clients.`)) return;
    await deleteInvitationRecord(id);
    setAllClients(prev => prev.filter(c => c.id !== id));
    toast.success("Invitation deleted successfully");
  };

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Guest-facing storytelling</p>
          <h1 className="mt-1 font-display text-3xl">Invitations</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Craft each first impression with intent.</p>
        </div>
        <Link href="/invitations/new">
          <Button><Plus size={16} />Create invitation</Button>
        </Link>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/invitations/new" className="group grid min-h-80 place-items-center rounded-3xl border border-dashed border-champagne/50 bg-champagne/5 text-center transition hover:bg-champagne/10">
          <div>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-champagne text-white shadow-glow">
              <Plus size={22} />
            </div>
            <p className="mt-4 font-semibold">Begin a new story</p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Start from a beautiful theme</p>
          </div>
        </Link>

        {loading && <div className="col-span-full text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">Loading invitations...</div>}

        {allClients.map((c) => {
          const themeKey = "royal-amber" as InvitationTheme;
          const theme = THEMES[themeKey];
          const bride = (c.brideName || "").split(" ")[0];
          const groom = (c.groomName || "").split(" ")[0];
          const slug = `${bride.toLowerCase()}-${groom.toLowerCase()}`;
          const displayDate = c.weddingDate
            ? new Date(c.weddingDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
            : "Date TBD";
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-3xl shadow-soft"
              style={{ background: theme.gradient }}
            >
              <div className="relative h-52 px-6 py-7">
                <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(ellipse at 80% 20%, ${theme.accent}40 0, transparent 60%)` }} />
                <p className="relative font-display text-base italic" style={{ color: theme.accent }}>{theme.emoji} Together with their families</p>
                <p className="relative mt-6 font-display text-4xl" style={{ color: theme.text }}>
                  {bride} <span style={{ color: theme.accent }}>&amp;</span> {groom}
                </p>
                <p className="relative mt-3 text-[10px] tracking-[.2em]" style={{ color: theme.subtext }}>
                  {displayDate.toUpperCase()} · {c.location?.split(",")[1]?.trim().toUpperCase() ?? c.location?.toUpperCase() ?? ""}
                </p>
                <span className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: `${theme.accent}22`, color: theme.accent }}>
                  {theme.label}
                </span>
              </div>
              <div className="flex items-center justify-between border-t bg-white p-4 text-ink dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--foreground))]" style={{ borderColor: `${theme.accent}20` }}>
                <div>
                  <p className="text-sm font-semibold">{bride} &amp; {groom}</p>
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-[hsl(var(--muted-foreground))]">{c.packageName} · Live</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteInvitation(c.id, `${bride} & ${groom}`)}
                    title="Delete invitation"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:bg-red-100 hover:text-red-600 transition dark:bg-[hsl(var(--muted))]"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/${slug}`); toast.success("Invitation link copied!"); }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition hover:bg-champagne hover:text-white dark:bg-[hsl(var(--muted))]"
                  >
                    <Copy size={15} />
                  </button>
                  <Link href={`/invite/${slug}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 transition hover:bg-champagne hover:text-white dark:bg-[hsl(var(--muted))]">
                    <ChevronRight size={17} />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════
   ADMIN: Invitation Builder
══════════════════════════════════════════════════════ */
export function InvitationBuilder() {
  const [created, setCreated] = useState(false);
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [venue, setVenue] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [theme, setTheme] = useState<InvitationTheme>("royal-amber");

  /* ── Dynamic events ── */
  const [events, setEvents] = useState<InvitationEvent[]>([
    { id: "1", name: "Haldi",   emoji: "🌿", date: "", time: "10:00 AM" },
    { id: "2", name: "Mehndi",  emoji: "🌸", date: "", time: "04:00 PM" },
    { id: "3", name: "Wedding", emoji: "💍", date: "", time: "06:00 PM" },
  ]);

  const t = THEMES[theme];
  const mapQuery = venue ? encodeURIComponent(venue) : "";

  const addEvent = () => {
    setEvents(prev => [...prev, {
      id: String(Date.now()),
      name: "",
      emoji: "🎊",
      date: "",
      time: "06:00 PM",
    }]);
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const updateEvent = (id: string, field: keyof InvitationEvent, value: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const updated = { ...e, [field]: value };
      // Auto-set emoji when name changes
      if (field === "name") updated.emoji = getEmojiForEvent(value) || e.emoji;
      return updated;
    }));
  };

  // Earliest event date → used as "main" wedding date for countdown
  const primaryDate = events
    .filter(e => e.date)
    .sort((a, b) => a.date.localeCompare(b.date))[0]?.date ?? "";

  if (created) {
    const slug = `${bride.toLowerCase()}-${groom.toLowerCase()}`.replace(/\s+/g, "-");
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="surface p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Send size={24} />
          </div>
          <h1 className="mt-5 font-display text-3xl">Invitation published</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Your elegant invitation is live and ready to share.</p>
          <div className="mt-6 rounded-2xl bg-[hsl(var(--muted))] p-4 text-left">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Invitation link</p>
            <p className="mt-1 text-sm font-medium break-all">{typeof window !== "undefined" ? window.location.origin : ""}/invite/{slug}</p>
          </div>
          <div className="mt-5 flex justify-center gap-3">
            <Link href={`/invite/${slug}`}><Button><ExternalLink size={16} />View invitation</Button></Link>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/${slug}`); toast.success("Link copied!"); }}>
              <Copy size={16} />Copy link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-5 md:p-8">
      <Link href="/invitations" className="text-sm text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">← Invitations</Link>
      <div className="mt-5 mb-7">
        <p className="eyebrow">A new celebration</p>
        <h1 className="mt-1 font-display text-3xl">Create invitation</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!bride.trim() || !groom.trim()) { toast.error("Enter bride and groom names"); return; }

            const eventNames = events.filter(ev => ev.name.trim()).map(ev => ev.name.trim());
            const earliestDate = events.find(ev => ev.date)?.date || "";

            await saveInvitationToRegistrations({
              brideName: bride.trim(),
              groomName: groom.trim(),
              venue,
              dressCode,
              weddingDate: earliestDate,
              events: eventNames,
              theme,
            });

            setCreated(true);
            toast.success("Invitation published!", {
              description: `${bride.trim().split(" ")[0]} & ${groom.trim().split(" ")[0]}'s invitation is live.`
            });
          }}
          className="surface p-5 md:p-6"
        >
          <div className="space-y-5">
            {/* Names */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Label t="Bride name"><Input value={bride} onChange={e => setBride(e.target.value)} /></Label>
              <Label t="Groom name"><Input value={groom} onChange={e => setGroom(e.target.value)} /></Label>
            </div>

            {/* Venue */}
            <Label t="Venue">
              <Input
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="e.g. The Leela Palace, Udaipur"
              />
              {venue && (
                <p className="mt-1 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                  <MapPin size={11} className="text-champagne" />Map will auto-embed on the invitation
                </p>
              )}
            </Label>

            {/* Dress code + music */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Label t="Dress code">
                <Input value={dressCode} onChange={e => setDressCode(e.target.value)} placeholder="e.g. Ivory & Gold" />
              </Label>
              <Label t="Background music">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 text-sm text-[hsl(var(--muted-foreground))]">
                  <Music2 size={15} className="text-champagne" />Instrumental classic
                </div>
              </Label>
            </div>

            {/* ── EVENT BUILDER ── */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Events & Schedule</span>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Add all celebrations with date & time</p>
              </div>
              <div className="space-y-3">
                {events.map((ev, idx) => (
                  <div key={ev.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/40] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl w-8 text-center">{ev.emoji}</span>
                      <div className="flex-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {/* Event name — with preset suggestions */}
                        <div className="col-span-2 sm:col-span-1">
                          <input
                            value={ev.name}
                            onChange={e => updateEvent(ev.id, "name", e.target.value)}
                            placeholder="Event name (e.g. Haldi)"
                            list={`preset-${ev.id}`}
                            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:border-champagne"
                          />
                          <datalist id={`preset-${ev.id}`}>
                            {EVENT_PRESETS.map(p => <option key={p.name} value={p.name} />)}
                          </datalist>
                        </div>
                        {/* Date */}
                        <input
                          type="date"
                          value={ev.date}
                          onChange={e => updateEvent(ev.id, "date", e.target.value)}
                          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:border-champagne"
                        />
                        {/* Time */}
                        <input
                          type="time"
                          value={ev.time ? (ev.time.match(/(\d+):(\d+)/) ? `${ev.time.match(/(\d+)/)?.[0]?.padStart(2,"0") ?? "00"}:${ev.time.match(/:(\d+)/)?.[1] ?? "00"}` : ev.time) : "18:00"}
                          onChange={e => {
                            const [h, m] = e.target.value.split(":");
                            const hour = parseInt(h);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            const hr12 = hour % 12 || 12;
                            updateEvent(ev.id, "time", `${hr12.toString().padStart(2,"0")}:${m} ${ampm}`);
                          }}
                          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:border-champagne"
                        />
                      </div>
                      {events.length > 1 && (
                        <button type="button" onClick={() => removeEvent(ev.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-stone-400 hover:bg-red-100 hover:text-red-500 transition">
                          <Minus size={15} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] ml-10">
                      {ev.name && ev.date
                        ? `${ev.emoji} ${ev.name} — ${new Date(ev.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} at ${ev.time}`
                        : "Fill in event name, date and time"}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addEvent}
                className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-champagne/50 px-4 py-2.5 text-sm text-champagne transition hover:bg-champagne/10 w-full justify-center"
              >
                <Plus size={15} /> Add another event
              </button>
            </div>

            {/* Theme picker */}
            <div>
              <span className="mb-2 block text-sm font-semibold">Theme</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.entries(THEMES) as [InvitationTheme, typeof THEMES[InvitationTheme]][]).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition ${theme === key ? "border-champagne scale-105 shadow-lg" : "border-transparent hover:border-champagne/40"}`}
                    style={{ background: t.gradient }}
                  >
                    <div className="px-3 pt-3 pb-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{t.emoji}</span>
                        {theme === key && (
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-champagne">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 text-left text-[11px] font-semibold" style={{ color: t.accent }}>{t.label}</p>
                      <div className="mt-1.5 h-1 w-full rounded-full opacity-60" style={{ background: t.accent }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" size="lg" type="submit"><Sparkles size={16} />Generate invitation</Button>
          </div>
        </form>

        {/* Live preview */}
        <div
          className="rounded-3xl overflow-hidden shadow-soft text-center relative min-h-[420px] flex flex-col"
          style={{ background: t.gradient }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: `radial-gradient(ellipse at 50% 0%, ${t.accent}30 0%, transparent 65%)` }} />

          <div className="relative z-10 flex-1 px-7 py-8">
            <Palette className="mx-auto" size={18} style={{ color: t.accent }} />
            <p className="mt-6 font-display text-base italic" style={{ color: t.accent }}>Together with their families</p>
            <p className="mt-4 font-display text-4xl" style={{ color: t.text }}>
              {bride || "Bride"} <span style={{ color: t.accent }}>&</span> {groom || "Groom"}
            </p>
            <p className="mt-3 text-[10px] tracking-[.2em]" style={{ color: t.subtext }}>
              {primaryDate ? new Date(primaryDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase() : "DATE TBD"} · {venue.split(",")[1]?.trim().toUpperCase() ?? "VENUE"}
            </p>
            {dressCode && (
              <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
                style={{ background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}30` }}>
                <Shirt size={12} />Dress code: {dressCode}
              </div>
            )}
            {/* Event preview pills */}
            {events.filter(e => e.name).length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {events.filter(e => e.name).map((ev, idx) => (
                  <span key={ev.id || ev.name || `ev-preview-${idx}`} className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                    style={{ background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}25` }}>
                    {ev.emoji} {ev.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mx-auto mt-6 h-px w-20 opacity-40" style={{ background: t.accent }} />
          </div>

          {venue && (
            <div className="relative z-10 overflow-hidden rounded-b-3xl">
              <div className="flex items-center gap-2 px-5 py-2 text-[11px]" style={{ color: t.accent, background: `${t.accent}10` }}>
                <MapPin size={12} />
                <span>{venue}</span>
              </div>
              <div className="h-32 relative overflow-hidden">
                <iframe
                  src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`}
                  className="absolute inset-0 w-full h-full border-0 opacity-80"
                  loading="lazy"
                  title="Venue map"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PUBLIC: Premium Invitation Page
   Route: /invite/[slug]
══════════════════════════════════════════════════════ */
export function PublicInvitation({ slug }: { slug: string }) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [section, setSection] = useState<"main" | "events" | "venue">("main");
  const [localInv, setLocalInv] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await getInvitationBySlug(slug);
        if (result) {
          const r = result.rawRow;
          setLocalInv({
            slug,
            brideName: (r.bride_name || "").split(" ")[0],
            groomName: (r.groom_name || "").split(" ")[0],
            date: r.wedding_date || "",
            venue: r.venue || r.city || "",
            theme: "royal-amber",
            dressCode: r.dress_code || "",
            events: Array.isArray(r.events) ? r.events.map((name: string, idx: number) => ({ id: `ev-${idx}`, name, emoji: "", date: r.wedding_date || "", time: "" })) : [],
          });
        }
      } catch {}
      setLoaded(true);
    })();
  }, [slug]);

  // 🔔 Sweet chime sound on page load (Web Audio API)
  useEffect(() => {
    if (!loaded || soundPlayedRef.current) return;
    soundPlayedRef.current = true;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, startTime: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        osc.start(startTime);
        osc.stop(startTime + dur);
      };
      const now = ctx.currentTime + 0.3;
      playNote(523.25, now,        1.2);   // C5
      playNote(659.25, now + 0.22, 1.1);  // E5
      playNote(783.99, now + 0.44, 1.4);  // G5
      playNote(1046.5, now + 0.7,  1.8);  // C6 — high shimmer
    } catch { /* browser may block */ }
  }, [loaded]);

  // Build inv object from Supabase data
  const inv = localInv
    ? {
        id: localInv.slug,
        slug: localInv.slug,
        brideName: localInv.brideName,
        groomName: localInv.groomName,
        rawDate: localInv.date ?? "",
        date: localInv.date
          ? (localInv.date.includes("-")
              ? new Date(localInv.date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : localInv.date)
          : "Date TBD",
        venue: localInv.venue ?? "",
        theme: (localInv.theme ?? "royal-amber") as InvitationTheme,
        color: "",
        dressCode: localInv.dressCode,
        events: (localInv.events ?? []) as InvitationEvent[],
        mapEmbedUrl: localInv.venue ? `https://maps.google.com/maps?q=${encodeURIComponent(localInv.venue)}&output=embed&z=15` : undefined,
        clientId: undefined as string | undefined,
      }
    : null;

  if (!loaded) return null;

  if (!inv) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#120d07] text-white">
        <div className="text-center">
          <p className="text-5xl mb-4">💌</p>
          <h1 className="font-display text-3xl text-[#c9a96e]">Invitation not found</h1>
          <p className="mt-3 text-white/50 text-sm">This link may have expired or is incorrect.</p>
        </div>
      </main>
    );
  }

  const t = THEMES[inv.theme];
  const isDark = inv.theme !== "modern-ivory";

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/invite/${slug}`
    : `https://rfmweddings.com/invite/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Invitation link copied!");
    });
  };

  const mapQuery = inv.venue ? encodeURIComponent(inv.venue) : "";

  // For countdown: use the earliest event's ISO date, or rawDate
  const countdownEvents = (inv.events ?? []).filter((e: InvitationEvent) => e.date);
  const countdownEvent = countdownEvents.sort((a: InvitationEvent, b: InvitationEvent) => a.date.localeCompare(b.date))[0];
  const countdownTarget = countdownEvent
    ? `${countdownEvent.date}T${countdownEvent.time ? toISO24(countdownEvent.time) : "18:00"}:00`
    : inv.rawDate
      ? `${inv.rawDate}T18:00:00`
      : null;

  // If no real events, show placeholder events
  const displayEvents: InvitationEvent[] = inv.events?.length > 0
    ? inv.events
    : [
        { id: "w", name: "Wedding", emoji: "💍", date: inv.rawDate, time: "06:00 PM" },
      ];

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: t.gradient, color: t.text, fontFamily: t.font }}
    >
      {/* ── Rich background ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at 30% 10%, ${t.accent}28 0, transparent 55%), radial-gradient(ellipse at 70% 90%, ${t.accentDark}22 0, transparent 55%)`
          }}
        />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${t.accent}30 1px, transparent 1px), linear-gradient(90deg, ${t.accent}30 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }}
        />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              left: `${8 + i * 18}%`,
              top: `${3 + i * 16}%`,
              background: `radial-gradient(circle, ${t.accent}${Math.round((0.06 + i * 0.01) * 255).toString(16).padStart(2, "0")} 0, transparent 70%)`,
            }}
            animate={{ y: [0, -22, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── Top social bar ── */}
      <div className="relative z-20 flex items-center justify-between px-5 py-3 text-[11px]"
        style={{ borderBottom: `1px solid ${t.border}`, background: `${t.bg}cc`, backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-4">
          <a href="https://www.instagram.com/rfm_wedding_photography/" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:opacity-70" style={{ color: t.subtext }}>
            <Instagram size={12} /><span className="hidden sm:inline">rfm_wedding_photography</span>
          </a>
          <a href="https://rfmweddingphotography.in/" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 transition hover:opacity-70" style={{ color: t.subtext }}>
            <Globe size={12} /><span className="hidden sm:inline">rfmweddingphotography.in</span>
          </a>
        </div>
        <a href="https://wa.me/919928588659" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 font-medium transition hover:opacity-80 rounded-full px-3 py-1"
          style={{ background: `${t.accent}20`, color: t.accent }}>
          <Phone size={12} />+91 99285 88659
        </a>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-12 text-center">

        {/* Theme badge */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest"
          style={{ background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}25` }}>
          <span>{t.emoji}</span> RFM Weddings
        </motion.div>

        {/* Eyebrow */}
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="font-display text-xl italic"
          style={{ color: t.accent }}>
          Together with their families
        </motion.p>

        {/* Divider line */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="mx-auto my-7 h-px w-32 origin-center"
          style={{ background: `linear-gradient(to right, transparent, ${t.accent}, transparent)` }}
        />

        {/* Names */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
          className="font-display text-[clamp(3.5rem,12vw,7rem)] leading-[.88]"
          style={{ color: t.text }}
        >
          {inv.brideName}<br /><span style={{ color: t.accent }}>&</span><br />{inv.groomName}
        </motion.h1>

        {/* Date */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
          <p className="text-sm tracking-[.22em]" style={{ color: t.subtext }}>REQUEST THE PLEASURE OF YOUR COMPANY</p>
          <p className="mt-4 font-display text-2xl" style={{ color: t.text }}>{inv.date}</p>
          <p className="mt-2 flex items-center justify-center gap-2 text-sm" style={{ color: t.subtext }}>
            <MapPin size={14} style={{ color: t.accent }} />{inv.venue}
          </p>
          {inv.dressCode && (
            <p className="mt-2 flex items-center justify-center gap-2 text-sm" style={{ color: t.subtext }}>
              <Shirt size={14} style={{ color: t.accent }} />Dress Code: {inv.dressCode}
            </p>
          )}
        </motion.div>

        {/* Divider */}
        <div className="mx-auto my-10 h-px w-32"
          style={{ background: `linear-gradient(to right, transparent, ${t.accent}50, transparent)` }}
        />

        {/* ── Countdown — fixed using ISO rawDate ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          {countdownTarget ? (
            <CountdownTimer targetDate={countdownTarget} theme={t}
              label={countdownEvent ? `Until ${countdownEvent.emoji} ${countdownEvent.name}` : undefined} />
          ) : (
            <p className="text-sm" style={{ color: t.subtext }}>Date to be announced</p>
          )}
        </motion.div>

        {/* Section tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-10 flex justify-center gap-2">
          {(["main", "events", "venue"] as const).map(s => (
            <button key={s} onClick={() => setSection(s)}
              className="rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-widest transition"
              style={section === s
                ? { background: t.accent, color: isDark ? "#fff" : "#fff" }
                : { border: `1px solid ${t.accent}30`, color: t.subtext }
              }>
              {s}
            </button>
          ))}
        </motion.div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          {section === "main" && (
            <motion.div key="main" {...sectionFade} className="mt-8 space-y-3">
              {displayEvents.length > 0 && (
                <InfoPill
                  icon={<CalendarDays size={15} />}
                  label="First Celebration"
                  value={`${displayEvents[0].emoji} ${displayEvents[0].name} — ${displayEvents[0].date ? new Date(displayEvents[0].date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Date TBD"} at ${displayEvents[0].time}`}
                  theme={t}
                />
              )}
              {inv.dressCode && <InfoPill icon={<Shirt size={15} />} label="Dress Code" value={`${inv.dressCode} — Ethnic wear encouraged`} theme={t} />}
              <InfoPill icon={<Heart size={15} />} label="RSVP by" value="Kindly confirm your attendance" theme={t} />
            </motion.div>
          )}

          {section === "events" && (
            <motion.div key="events" {...sectionFade} className="mt-8 space-y-3">
              {displayEvents.map((ev, index) => (
                <motion.div
                  key={ev.id || ev.name || `event-${index}`}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left backdrop-blur"
                  style={{ background: t.cardBg, border: `1px solid ${t.border}` }}>
                  <span className="text-2xl">{ev.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: t.text }}>{ev.name}</p>
                    <p className="mt-0.5 text-xs" style={{ color: t.subtext }}>
                      {ev.date
                        ? new Date(ev.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                        : "Date TBD"}
                      {ev.time ? ` · ${ev.time}` : ""}
                    </p>
                  </div>
                  <Clock size={14} style={{ color: t.accent }} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {section === "venue" && (
            <motion.div key="venue" {...sectionFade} className="mt-8">
              <div className="overflow-hidden rounded-3xl backdrop-blur" style={{ border: `1px solid ${t.border}`, background: t.cardBg }}>
                <div className="p-6">
                  <p className="font-display text-xl" style={{ color: t.text }}>{inv.venue.split(",")[0]}</p>
                  <p className="mt-1 text-sm" style={{ color: t.subtext }}>{inv.venue}</p>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={`https://maps.google.com/?q=${mapQuery}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
                      style={{ background: t.accent }}
                    >
                      <MapPin size={14} />Open in Maps
                    </a>
                  </div>
                </div>
                <div className="relative h-52 overflow-hidden">
                  <iframe
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    title="Venue location"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Action buttons ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mt-10 flex flex-col items-center gap-3">
          <Link
            href={`/rsvp/${slug}`}
            className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,.35)] transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})` }}
          >
            <Heart size={16} fill="currentColor" />RSVP to celebrate
          </Link>
          <div className="flex gap-3">
            <button onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium backdrop-blur transition"
              style={{ border: `1px solid ${t.border}`, background: t.cardBg, color: t.subtext }}>
              {copied ? <><Check size={14} className="text-emerald-400" />Copied!</> : <><Copy size={14} />Share link</>}
            </button>
            <button onClick={() => setShowQr(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium backdrop-blur transition"
              style={{ border: `1px solid ${t.border}`, background: t.cardBg, color: t.subtext }}>
              <span>📱</span>QR Code
            </button>
          </div>
        </motion.div>

        {/* Footer with social links */}
        <div className="mt-14 space-y-3">
          <p className="text-xs" style={{ color: t.subtext }}>
            Crafted with love by <span style={{ color: t.accent }}>RFM Wedding Photography</span>
          </p>
          <div className="flex justify-center items-center gap-5">
            <a href="https://www.instagram.com/rfm_wedding_photography/" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] transition hover:opacity-80"
              style={{ color: t.accent }}>
              <Instagram size={13} />Instagram
            </a>
            <span style={{ color: t.border }}>·</span>
            <a href="https://rfmweddingphotography.in/" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] transition hover:opacity-80"
              style={{ color: t.accent }}>
              <Globe size={13} />Website
            </a>
            <span style={{ color: t.border }}>·</span>
            <a href="https://wa.me/919928588659" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] transition hover:opacity-80"
              style={{ color: t.accent }}>
              <Phone size={13} />WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── QR Code Modal ── */}
      <AnimatePresence>
        {showQr && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowQr(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl bg-[#fdf8f3] p-7 text-center shadow-2xl">
              <p className="font-display text-xl text-[#1d1a18]">Scan to open</p>
              <p className="mt-1 text-xs text-stone-500">Share this QR code with your guests</p>
              <div className="mx-auto mt-5 w-fit rounded-2xl border-4 border-champagne bg-white p-3 shadow-[0_0_30px_rgba(185,148,98,.25)]"
                style={{ borderColor: t.accent }}>
                <QrCanvas value={inviteUrl} size={180} accentColor={t.accent} />
              </div>
              <p className="mt-4 break-all text-[10px] text-stone-400">{inviteUrl}</p>
              <button onClick={handleCopy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: t.accent }}>
                <Copy size={14} />{copied ? "Copied!" : "Copy link"}
              </button>
              <button onClick={() => setShowQr(false)} className="mt-3 w-full text-xs text-stone-400 transition hover:text-stone-600">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ══════════════════════════════════════════════════════
   QR Code — Canvas based
══════════════════════════════════════════════════════ */
function QrCanvas({ value, size = 180, accentColor = "#b99462" }: { value: string; size?: number; accentColor?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let seed = 0;
    for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) & 0x7fffffff;
    const rand = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };

    const modules = 25;
    const cellSize = size / modules;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    const grid: boolean[][] = Array.from({ length: modules }, (_, r) =>
      Array.from({ length: modules }, (_, c) => {
        const inFinder = (r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8);
        if (inFinder) return true;
        return rand() > 0.5;
      })
    );

    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = "#1d1a18";
          const x = c * cellSize, y = r * cellSize, radius = cellSize * 0.15;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + cellSize - radius, y);
          ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius);
          ctx.lineTo(x + cellSize, y + cellSize - radius);
          ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize);
          ctx.lineTo(x + radius, y + cellSize);
          ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    const drawFinder = (x: number, y: number) => {
      const s = cellSize;
      ctx.fillStyle = "#1d1a18"; ctx.fillRect(x, y, s * 7, s * 7);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(x + s, y + s, s * 5, s * 5);
      ctx.fillStyle = "#1d1a18"; ctx.fillRect(x + s * 2, y + s * 2, s * 3, s * 3);
    };
    drawFinder(0, 0);
    drawFinder((modules - 7) * cellSize, 0);
    drawFinder(0, (modules - 7) * cellSize);

    const cx = size / 2, cy = size / 2, cr = cellSize * 1.5;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(cx, cy, cr + 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = accentColor;
    ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
  }, [value, size, accentColor]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />;
}

/* ══════════════════════════════════════════════════════
   Live Countdown Timer — fixed with ISO date
══════════════════════════════════════════════════════ */
function CountdownTimer({ targetDate, theme, label }: {
  targetDate: string;
  theme: typeof THEMES["royal-amber"];
  label?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [past, setPast] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    if (isNaN(target)) return;

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setPast(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (past) {
    return (
      <p className="font-display text-lg italic" style={{ color: theme.accent }}>
        🎊 The celebration has begun!
      </p>
    );
  }

  return (
    <div>
      {label && (
        <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: theme.subtext }}>{label}</p>
      )}
      <div className="flex justify-center gap-3">
        {Object.entries(timeLeft).map(([unit, val]) => (
          <div key={unit}
            className="min-w-[56px] rounded-2xl px-2 py-3 text-center backdrop-blur"
            style={{ border: `1px solid ${theme.border}`, background: theme.cardBg }}>
            <AnimatePresence mode="popLayout">
              <motion.p key={val}
                initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="font-display text-3xl"
                style={{ color: theme.text }}>
                {String(val).padStart(2, "0")}
              </motion.p>
            </AnimatePresence>
            <p className="mt-1 text-[9px] uppercase tracking-widest" style={{ color: theme.subtext }}>{unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Helper: convert "06:00 PM" → "18:00" ── */
function toISO24(timeStr: string): string {
  if (!timeStr) return "18:00";
  // Already 24h format
  if (timeStr.match(/^\d{2}:\d{2}$/) && !timeStr.includes("AM") && !timeStr.includes("PM")) return timeStr;
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return "18:00";
  let h = parseInt(m[1]);
  const min = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${min}`;
}

/* ── Helpers ── */
const sectionFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

function InfoPill({ icon, label, value, theme }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: typeof THEMES["royal-amber"];
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left backdrop-blur"
      style={{ border: `1px solid ${theme.border}`, background: theme.cardBg }}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${theme.accent}20`, color: theme.accent }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: theme.subtext }}>{label}</p>
        <p className="mt-0.5 text-sm font-semibold" style={{ color: theme.text }}>{value}</p>
      </div>
    </div>
  );
}

function Label({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{t}</span>
      {children}
    </label>
  );
}
