"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Check, Heart, MapPin, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { mapSupabaseClient } from "@/services/clients";
import { fetchAllSupabaseRsvps } from "@/services/rsvps";
import type { Client, Rsvp } from "@/types";

/* ─── Props ─── */
interface RsvpClientViewProps {
  portalCode: string;
}

/* ─── Animated counter hook ─── */
function useAnimatedCounter(target: number, duration = 1.2) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 30, stiffness: 100, duration });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionVal.set(target);
  }, [target, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return display;
}

/* ─── Animated Number ─── */
function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [started, setStarted] = useState(false);
  const count = useAnimatedCounter(started ? value : 0);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setStarted(true), delay * 1000);
      return () => clearTimeout(t);
    }
  }, [inView, delay]);

  return <span ref={ref}>{count}</span>;
}

/* ─── Circular Progress Ring ─── */
function ProgressRing({
  percent,
  size = 80,
  strokeWidth = 6,
  color = "#c9a96e",
  delay = 0,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  delay?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ref = useRef<SVGCircleElement>(null);
  const inView = useInView(ref, { once: true });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setProgress(percent), delay * 1000 + 300);
      return () => clearTimeout(t);
    }
  }, [inView, percent, delay]);

  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <circle
        ref={ref}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s` }}
      />
    </svg>
  );
}

/* ─── Particles ─── */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  duration: 3 + (i % 4),
  delay: (i * 0.3) % 4,
  size: i % 3 === 0 ? "h-2 w-2" : "h-1.5 w-1.5",
}));

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full bg-[#c9a96e] ${p.size} opacity-0`}
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.55, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  icon,
  glowColor,
  delay,
  subLabel,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  glowColor: string;
  delay: number;
  subLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
      style={{ boxShadow: `0 0 40px ${glowColor}18, inset 0 1px 0 rgba(255,255,255,0.08)` }}
    >
      {/* Subtle glow orb */}
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl"
        style={{ background: `${glowColor}22` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">{label}</p>
          <p className="mt-2 font-display text-4xl font-light text-white">
            <AnimatedNumber value={value} delay={delay + 0.1} />
          </p>
          {subLabel && (
            <p className="mt-1.5 text-xs text-white/40">{subLabel}</p>
          )}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${glowColor}22`, color: glowColor }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Food Badge ─── */
function FoodBadge({ food }: { food: "Veg" | "Non Veg" }) {
  const isVeg = food === "Veg";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
        isVeg
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-orange-500/15 text-orange-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isVeg ? "bg-emerald-400" : "bg-orange-400"}`} />
      {food}
    </span>
  );
}

/* ─── Attendance Badge ─── */
function AttendanceBadge({ attending }: { attending: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
        attending
          ? "bg-[#c9a96e]/15 text-[#c9a96e]"
          : "bg-white/5 text-white/35"
      }`}
    >
      {attending ? (
        <Check size={9} strokeWidth={2.5} />
      ) : (
        <X size={9} strokeWidth={2.5} />
      )}
      {attending ? "Attending" : "Declined"}
    </span>
  );
}

/* ─── Guest Card ─── */
function GuestCard({ guest, index }: { guest: Rsvp; index: number }) {
  const initials = guest.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4 backdrop-blur-sm transition hover:border-[#c9a96e]/30 hover:bg-white/8"
    >
      {/* Avatar */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a96e]/30 to-[#8b6340]/20 text-xs font-bold text-[#c9a96e]">
        {initials}
        {guest.attending && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#1a1108]">
            <Check size={7} strokeWidth={3} className="text-white" />
          </div>
        )}
      </div>

      {/* Name & meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{guest.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-white/40">
            <Users size={10} />
            {guest.members} {guest.members === 1 ? "member" : "members"}
          </span>
          {guest.events.length > 0 && (
            <span className="text-white/20">·</span>
          )}
          {guest.events.length > 0 && (
            <span className="truncate text-xs text-white/40">
              {guest.events.join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <FoodBadge food={guest.food} />
        <AttendanceBadge attending={guest.attending} />
      </div>
    </motion.div>
  );
}

/* ─── Event Breakdown Card ─── */
function EventBreakdownCard({
  eventTitle,
  count,
  total,
  index,
}: {
  eventTitle: string;
  count: number;
  total: number;
  index: number;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  const ringColors = ["#c9a96e", "#e07b7b", "#6b8fce", "#82c88c"];
  const color = ringColors[index % ringColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
    >
      <div className="relative flex items-center justify-center">
        <ProgressRing percent={percent} size={88} strokeWidth={7} color={color} delay={0.2 + index * 0.12} />
        <div className="absolute flex flex-col items-center">
          <span className="font-display text-2xl font-light text-white">{count}</span>
          <span className="text-[10px] text-white/40">guests</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-white/90">{eventTitle}</p>
        <p className="mt-0.5 text-xs text-white/40">{percent}% confirmed</p>
      </div>
    </motion.div>
  );
}

/* ─── Not Found Screen ─── */
function NotFound({ code }: { code: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1a1108] via-[#221508] to-[#2b1d0e] px-6 text-center text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <Heart size={28} className="text-[#c9a96e]/50" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Page not found</h1>
        <p className="mt-3 text-sm text-white/45">
          No wedding found for portal code{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#c9a96e]">{code}</code>.
        </p>
      </motion.div>
    </main>
  );
}

/* ─── Gold Divider ─── */
function GoldDivider() {
  return (
    <div className="mx-auto my-8 h-px w-32 bg-gradient-to-r from-transparent via-[#c9a96e]/60 to-transparent" />
  );
}

/* ─── Main Component ─── */
export function RsvpClientView({ portalCode }: RsvpClientViewProps) {
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [allRsvps, setAllRsvps] = useState<Rsvp[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cleanCode = portalCode.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

        // Fetch clients from Supabase
        const db = createClient();
        const { data: regData } = await db.from("registrations").select("*").order("created_at", { ascending: false });
        const supaClients = (regData || []).map(mapSupabaseClient);

        // Find matching client by portalCode, id, or bride/groom name slug
        const found = supaClients.find(c => {
          if (!c) return false;
          const pCode = (c.portalCode || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
          const cId = String(c.id).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
          const bFirst = (c.brideName || "").split(" ")[0].toLowerCase().trim();
          const gFirst = (c.groomName || "").split(" ")[0].toLowerCase().trim();
          const slug1 = `${bFirst}${gFirst}`;
          const slug2 = `${gFirst}${bFirst}`;
          return pCode === cleanCode || cId === cleanCode || slug1 === cleanCode || slug2 === cleanCode;
        });
        if (found) setClient(found);

        // Fetch live RSVPs from Supabase
        const supabaseRsvps = await fetchAllSupabaseRsvps();
        setAllRsvps(supabaseRsvps);
      } catch {}
    };

    loadData();

    const intervalId = setInterval(loadData, 3000);

    let channel: any = null;
    try {
      if (isSupabaseConfigured()) {
        const db = createClient();
        channel = db
          .channel("public:rsvps_client_view")
          .on("postgres_changes", { event: "*", schema: "public", table: "rsvps" }, () => {
            loadData();
          })
          .subscribe();
      }
    } catch {}

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (channel) {
        try {
          const db = createClient();
          db.removeChannel(channel);
        } catch {}
      }
    };
  }, [portalCode]);

  if (!client) {
    return <NotFound code={portalCode} />;
  }

  const brideFirst = client.brideName.split(" ")[0].toLowerCase();
  const groomFirst = client.groomName.split(" ")[0].toLowerCase();
  const slug = `${brideFirst}-${groomFirst}`;

  const clientRsvps: Rsvp[] = allRsvps.filter((r) => {
    const rid = (r.clientId || "").toLowerCase().trim();
    const cid = String(client.id).toLowerCase().trim();
    return rid === cid || rid === slug || rid === `${groomFirst}-${brideFirst}`;
  });
  const attending = clientRsvps.filter((r) => r.attending);

  const totalMembers = attending.reduce((acc, r) => acc + r.members, 0);
  const confirmedCount = attending.length;
  const vegMembers = attending
    .filter((r) => r.food === "Veg")
    .reduce((acc, r) => acc + r.members, 0);
  const nonVegMembers = attending
    .filter((r) => r.food === "Non Veg")
    .reduce((acc, r) => acc + r.members, 0);

  /* Event breakdown — count attending members per event */
  const eventCounts: Record<string, number> = {};
  for (const r of attending) {
    for (const ev of r.events) {
      eventCounts[ev] = (eventCounts[ev] ?? 0) + r.members;
    }
  }

  const eventBreakdown = client.timeline
    .filter((t) => t.type === "event")
    .map((t) => ({
      title: t.title,
      count: eventCounts[t.title] ?? 0,
    }));

  const brideName = client.brideName.split(" ")[0];
  const groomName = client.groomName.split(" ")[0];

  const formattedDate = client.weddingDate
    ? (client.weddingDate.includes("-") ? new Date(client.weddingDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : client.weddingDate)
    : "Date TBD";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a1108] via-[#221508] to-[#2b1d0e] text-white">
      {/* ── Background layers ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 15% 10%, #c9a96e 0, transparent 55%), radial-gradient(ellipse at 85% 90%, #8b5e3c 0, transparent 55%)",
        }}
      />
      {/* Subtle noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
        }}
      />

      <Particles />

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center px-5 pb-10 pt-16 text-center md:pt-24">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-xs font-medium uppercase tracking-[0.25em] text-[#c9a96e]/70"
        >
          You&apos;re invited
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="my-5 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent"
        />

        {/* Couple name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-6xl leading-none tracking-tight md:text-8xl lg:text-9xl"
        >
          {brideName}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
            className="mx-4 inline-block text-[#c9a96e] md:mx-6"
          >
            &amp;
          </motion.span>
          {groomName}
        </motion.h1>

        {/* Date & location */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-7 flex flex-col items-center gap-2 sm:flex-row sm:gap-4"
        >
          <span className="text-sm uppercase tracking-widest text-white/45">
            {formattedDate}
          </span>
          <span className="hidden text-white/20 sm:block">·</span>
          <span className="flex items-center gap-1.5 text-sm text-white/45">
            <MapPin size={13} className="text-[#c9a96e]/60" />
            {client.location}
          </span>
        </motion.div>

        {/* Glowing heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7, type: "spring", stiffness: 180 }}
          className="mt-8"
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a96e] to-[#8b6340]"
            style={{ boxShadow: "0 0 40px rgba(201,169,110,0.35), 0 0 80px rgba(201,169,110,0.15)" }}
          >
            <Heart size={24} fill="white" className="text-white" />
          </motion.div>
        </motion.div>

        <GoldDivider />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs font-medium uppercase tracking-[0.2em] text-white/30"
        >
          Guest response overview
        </motion.p>
      </section>

      {/* ── STAT CARDS ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Guests"
            value={totalMembers}
            icon={<Users size={18} />}
            glowColor="#c9a96e"
            delay={0.1}
            subLabel={`${clientRsvps.length} ${clientRsvps.length === 1 ? "family" : "families"}`}
          />
          <StatCard
            label="Confirmed"
            value={confirmedCount}
            icon={<Check size={18} />}
            glowColor="#82c88c"
            delay={0.2}
            subLabel={`${
              clientRsvps.length > 0
                ? Math.round((confirmedCount / clientRsvps.length) * 100)
                : 0
            }% response rate`}
          />
          <StatCard
            label="Vegetarian"
            value={vegMembers}
            icon={<span className="text-base leading-none">🥗</span>}
            glowColor="#82c88c"
            delay={0.3}
            subLabel="Veg meals"
          />
          <StatCard
            label="Non-Vegetarian"
            value={nonVegMembers}
            icon={<span className="text-base leading-none">🍗</span>}
            glowColor="#e07b7b"
            delay={0.4}
            subLabel="Non-veg meals"
          />
        </div>
      </section>

      {/* ── GUEST LIST ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-5 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a96e]/70">
              Attendance
            </p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl">Guest Responses</h2>
          </div>
          <div className="flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/50 backdrop-blur">
            <Users size={13} className="text-[#c9a96e]" />
            {clientRsvps.length} {clientRsvps.length === 1 ? "response" : "responses"}
          </div>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence>
            {clientRsvps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center"
              >
                <Heart size={28} className="text-[#c9a96e]/30" />
                <p className="text-sm text-white/30">No RSVPs yet — share your link!</p>
              </motion.div>
            ) : (
              clientRsvps.map((guest, i) => (
                <GuestCard key={guest.id} guest={guest} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── EVENT BREAKDOWN ── */}
      {eventBreakdown.length > 0 && (
        <section className="relative z-10 mx-auto max-w-5xl px-5 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-5"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-[#c9a96e]/70">
              Celebrations
            </p>
            <h2 className="mt-1 font-display text-2xl md:text-3xl">Event Breakdown</h2>
          </motion.div>

          <div
            className={`grid gap-4 ${
              eventBreakdown.length === 1
                ? "max-w-xs"
                : eventBreakdown.length === 2
                ? "grid-cols-2 max-w-sm"
                : eventBreakdown.length === 3
                ? "grid-cols-3 sm:max-w-lg"
                : "grid-cols-2 sm:grid-cols-4"
            }`}
          >
            {eventBreakdown.map((ev, i) => (
              <EventBreakdownCard
                key={ev.title}
                eventTitle={ev.title}
                count={ev.count}
                total={totalMembers}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 py-10 text-center">
        <GoldDivider />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart size={16} fill="#c9a96e" className="text-[#c9a96e]" />
          </motion.div>
          <p className="text-xs uppercase tracking-widest text-white/20">
            Powered by{" "}
            <span className="font-semibold text-[#c9a96e]/50">RFM Weddings</span>
          </p>
          <p className="text-[10px] text-white/15">
            Crafted with love for {brideName} &amp; {groomName}&apos;s special day
          </p>
        </motion.div>
      </footer>
    </main>
  );
}
