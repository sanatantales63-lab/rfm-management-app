"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Heart, Loader2, MapPin, Minus, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { submitRsvp } from "@/services/rsvps";
import { mapSupabaseClient } from "@/services/clients";

/* ── RSVP reads invitation data from 'registrations' table ── */
async function getRegistrationBySlug(slug: string) {
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

/* ─── Types ─── */
type Step = "welcome" | "events" | "food" | "members" | "note" | "done";

/* Emoji map for auto-matching event names */
const EVENT_EMOJI_MAP: Record<string, string> = {
  haldi: "🌿", mehndi: "🌸", sangeet: "🎶", wedding: "💍",
  reception: "✨", engagement: "💎", tilak: "🏵️", bidai: "🌺",
};

function getEventEmoji(name: string): string {
  return EVENT_EMOJI_MAP[name.toLowerCase().trim()] ?? "🎊";
}

interface RsvpEvent {
  key: string;
  emoji: string;
  /** Display string: e.g. "22 November 2026 · 10:00 AM" */
  date: string;
  color: string;
}

const totalSteps = 5;
const stepIndex: Record<Step, number> = { welcome: 0, events: 1, food: 2, members: 3, note: 4, done: 5 };

/* ─── Main Component ─── */
export function RsvpPublic({ slug }: { slug?: string }) {
  const [wedding, setWedding] = useState({
    bride: "Bride",
    groom: "Groom",
    date: "Date TBD",
    location: "Venue TBD",
    rsvpDeadline: "15 October 2026",
    events: [] as RsvpEvent[],
    clientId: "1",
  });

  useEffect(() => {
    if (!slug) return;
    const cleanSlug = slug.toLowerCase().trim();
    const [brideSlug, groomSlug] = cleanSlug.split("-");

    (async () => {
      try {
        if (isSupabaseConfigured() && brideSlug && groomSlug) {
          const result = await getRegistrationBySlug(cleanSlug);
          if (result) {
            const r = result.rawRow;
            const bf = (r.bride_name || "").split(" ")[0];
            const gf = (r.groom_name || "").split(" ")[0];
            const supaDate = r.wedding_date
              ? new Date(r.wedding_date + "T12:00:00").toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })
              : "Date TBD";

            let eventsList: RsvpEvent[] = [];
            if (Array.isArray(r.events) && r.events.length > 0) {
              eventsList = r.events.map((name: string, i: number) => ({
                key: name,
                emoji: getEventEmoji(name),
                date: supaDate,
                color: ["#f5a623", "#e07b7b", "#b99462", "#6b8fce", "#a78bfa", "#5fcf80"][i % 6],
              }));
            } else {
              eventsList = [{ key: "Wedding", emoji: "💍", date: supaDate, color: "#b99462" }];
            }

            setWedding({
              bride: bf, groom: gf, date: supaDate,
              location: r.venue || r.city || "Venue TBD",
              rsvpDeadline: "15 October 2026",
              events: eventsList,
              clientId: String(r.id),
            });
            eventsInitialized.current = false;
            return;
          }
        }
      } catch {}

      // Fallback: use slug names
      const bName = brideSlug ? brideSlug.charAt(0).toUpperCase() + brideSlug.slice(1) : "Bride";
      const gName = groomSlug ? groomSlug.charAt(0).toUpperCase() + groomSlug.slice(1) : "Groom";
      setWedding({
        bride: bName, groom: gName, date: "Date TBD",
        location: "Venue TBD", rsvpDeadline: "15 October 2026",
        events: [{ key: "Wedding", emoji: "💍", date: "To be announced", color: "#b99462" }],
        clientId: cleanSlug,
      });
      eventsInitialized.current = false;
    })();
  }, [slug]);

  // When wedding events load, pre-select all of them
  useEffect(() => {
    if (!eventsInitialized.current && wedding.events.length > 0) {
      setEvents(wedding.events.map(e => e.key));
      eventsInitialized.current = true;
    }
  }, [wedding.events]);

  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  // Pre-select all events once wedding data loads
  const eventsInitialized = useRef(false);
  const [food, setFood] = useState<"veg" | "non_veg">("veg");
  const [members, setMembers] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleEvent = (key: string) =>
    setEvents(prev => prev.includes(key) ? prev.filter(e => e !== key) : [...prev, key]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const newRsvp = {
      id: `rsvp-${Date.now()}`,
      clientId: wedding.clientId,
      name,
      phone,
      attending: attending ?? true,
      events,
      food: food === "non_veg" ? "Non Veg" : "Veg",
      members,
      notes: note,
      createdAt: new Date().toISOString(),
    };




    try {
      if (isSupabaseConfigured()) {
        await submitRsvp({
          clientId: wedding.clientId,
          guestName: name,
          phone,
          attending: attending ?? true,
          events,
          foodPreference: food,
          membersComing: members,
          specialNotes: note,
        });
      }
    } catch {
      /* ignore so step advances */
    } finally {
      setSubmitting(false);
      setStep("done");
    }
  };

  /* progress bar */
  const progress = step === "done" ? 100 : Math.round((stepIndex[step] / totalSteps) * 100);

  if (step === "done") {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-[#2b1d0e] via-[#3d2a14] to-[#1f1409] px-5 py-16 text-white">
        <Particles />
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="relative z-10 text-center">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#c9a96e] to-[#a07843] shadow-[0_0_50px_rgba(185,148,98,.5)]">
            <Heart size={36} fill="white" className="text-white" />
          </motion.div>
          <h1 className="mt-7 font-display text-5xl leading-tight">You&apos;re on the list!</h1>
          <p className="mt-4 text-lg text-white/70">Thank you, <span className="font-semibold text-[#e6bf91]">{name}</span>.</p>
          <p className="mt-2 text-sm text-white/50">{wedding.bride} & {wedding.groom} can&apos;t wait to celebrate with you.</p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-sm text-white/70 backdrop-blur">
            <MapPin size={15} className="text-[#c9a96e]" />
            {wedding.location}
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#2b1d0e] to-[#1a1108]">
      {/* Background */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at 20% 0%, #c9a96e 0, transparent 60%), radial-gradient(ellipse at 80% 100%, #8b6340 0, transparent 60%)" }} />
      <div className="absolute inset-0 subtle-grid opacity-10" />

      {/* Floating header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-6 md:px-8">
        <div className="font-display text-lg italic text-[#e6bf91]">{wedding.bride} & {wedding.groom}</div>
        <div className="text-xs text-white/40">{wedding.date}</div>
      </header>

      {/* Progress bar */}
      {step !== "welcome" && (
        <div className="relative z-10 px-5 md:px-8">
          <div className="mx-auto max-w-lg">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#c9a96e] to-[#e6bf91]" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="relative z-10 mx-auto max-w-lg px-5 py-8 md:px-8">
        <AnimatePresence mode="wait">
          {/* ── WELCOME ── */}
          {step === "welcome" && (
            <motion.div key="welcome" {...fadeSlide} className="text-center text-white">
              <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent" />
              <p className="font-display text-xl italic text-[#e6bf91]">Together with their families</p>
              <h1 className="mt-5 font-display text-6xl leading-none md:text-7xl">
                {wedding.bride}<br /><span className="text-[#c9a96e]">&</span><br />{wedding.groom}
              </h1>
              <p className="mt-6 text-sm tracking-[.18em] text-white/50">{wedding.date.toUpperCase()}{wedding.location && wedding.location !== "Venue TBD" ? ` · ${wedding.location.split(",")[0].toUpperCase()}` : ""}</p>
              <p className="mt-2 text-xs text-white/35">RSVP by {wedding.rsvpDeadline}</p>
              <div className="mx-auto mb-8 mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a96e] to-transparent" />

              <Card>
                <p className="mb-4 text-sm font-semibold text-[#1d1a18]">Your name</p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#e5d5bf] bg-[#faf7f3] px-4 py-3 text-sm text-[#1d1a18] outline-none transition placeholder:text-stone-400 focus:border-[#b99462] focus:ring-2 focus:ring-[#b99462]/20"
                />
                <p className="mb-2 mt-4 text-sm font-semibold text-[#1d1a18]">Phone number</p>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  type="tel"
                  className="w-full rounded-xl border border-[#e5d5bf] bg-[#faf7f3] px-4 py-3 text-sm text-[#1d1a18] outline-none transition placeholder:text-stone-400 focus:border-[#b99462] focus:ring-2 focus:ring-[#b99462]/20"
                />

                <p className="mb-3 mt-5 text-sm font-semibold text-[#1d1a18]">Will you be joining us?</p>
                <div className="grid grid-cols-2 gap-3">
                  <AttendButton active={attending === true} onClick={() => setAttending(true)} label="Yes, I'll be there! 🎉" />
                  <AttendButton active={attending === false} onClick={() => setAttending(false)} label="Sorry, can't make it 😔" />
                </div>

                <button
                  onClick={() => { if (!name.trim() || !phone.trim() || attending === null) { toast.error("Please fill in all fields"); return; } setStep(attending ? "events" : "note"); }}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b99462] to-[#9a7a4e] py-3.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(185,148,98,.4)] transition hover:opacity-90"
                >
                  Continue <ChevronRight size={17} />
                </button>
              </Card>
            </motion.div>
          )}

          {/* ── EVENTS ── */}
          {step === "events" && (
            <motion.div key="events" {...fadeSlide}>
              <StepHeader back={() => setStep("welcome")} title="Which celebrations will you attend?" subtitle="Tap to deselect any function you won't join" />
              <Card>
                {/* Select All / Clear row */}
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-stone-400">{events.length} of {wedding.events.length} selected</p>
                  <button
                    onClick={() => events.length === wedding.events.length ? setEvents([]) : setEvents(wedding.events.map(e => e.key))}
                    className="text-xs font-semibold text-[#b99462] transition hover:opacity-70"
                  >
                    {events.length === wedding.events.length ? "Clear all" : "Select all"}
                  </button>
                </div>
                <div className="space-y-3">
                  {wedding.events.map(ev => {
                    const active = events.includes(ev.key);
                    return (
                      <button key={ev.key} onClick={() => toggleEvent(ev.key)}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${active ? "border-[#b99462] bg-[#fdf6ec]" : "border-[#ede6db] bg-[#faf8f5] hover:border-[#d4c4a8]"}`}>
                        <span className="text-2xl">{ev.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-[#1d1a18]">{ev.key}</p>
                          <p className="text-xs text-stone-500">{ev.date}</p>
                        </div>
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${active ? "border-[#b99462] bg-[#b99462]" : "border-stone-300"}`}>
                          {active && <Check size={13} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <NavButtons onBack={() => setStep("welcome")} onNext={() => setStep("food")} disableNext={events.length === 0} />
              </Card>
            </motion.div>
          )}

          {/* ── FOOD ── */}
          {step === "food" && (
            <motion.div key="food" {...fadeSlide}>
              <StepHeader back={() => setStep("events")} title="Food preference" subtitle="We want to make sure you're taken care of" />
              <Card>
                <div className="grid grid-cols-2 gap-4">
                  <FoodCard active={food === "veg"} onClick={() => setFood("veg")} emoji="🥗" label="Vegetarian" sublabel="Pure Veg" color="emerald" />
                  <FoodCard active={food === "non_veg"} onClick={() => setFood("non_veg")} emoji="🍗" label="Non Vegetarian" sublabel="Includes meat" color="orange" />
                </div>
                <NavButtons onBack={() => setStep("events")} onNext={() => setStep("members")} />
              </Card>
            </motion.div>
          )}

          {/* ── MEMBERS ── */}
          {step === "members" && (
            <motion.div key="members" {...fadeSlide}>
              <StepHeader back={() => setStep("food")} title="How many guests?" subtitle="Including yourself" />
              <Card>
                <div className="flex flex-col items-center py-4">
                  <p className="mb-6 text-center text-sm text-stone-500">Total members attending from your side</p>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setMembers(m => Math.max(1, m - 1))}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#ede6db] bg-[#faf8f5] text-stone-600 transition hover:border-[#b99462] hover:text-[#b99462]">
                      <Minus size={22} />
                    </button>
                    <div className="text-center">
                      <motion.p key={members} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-7xl text-[#1d1a18]">{members}</motion.p>
                      <p className="mt-1 text-sm text-stone-400">{members === 1 ? "person" : "people"}</p>
                    </div>
                    <button onClick={() => setMembers(m => Math.min(20, m + 1))}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b99462] to-[#9a7a4e] text-white shadow-[0_4px_16px_rgba(185,148,98,.4)] transition hover:opacity-90">
                      <Plus size={22} />
                    </button>
                  </div>
                </div>
                <NavButtons onBack={() => setStep("food")} onNext={() => setStep("note")} />
              </Card>
            </motion.div>
          )}

          {/* ── NOTE ── */}
          {step === "note" && (
            <motion.div key="note" {...fadeSlide}>
              <StepHeader back={() => setStep("members")} title="Any message for the couple?" subtitle="Optional — share your wishes or special dietary needs" />
              <Card>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={attending ? "Share your blessings, wishes, or any special requests..." : "We'll miss you! Feel free to leave a message for the couple."}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-[#e5d5bf] bg-[#faf7f3] p-4 text-sm text-[#1d1a18] outline-none transition placeholder:text-stone-400 focus:border-[#b99462] focus:ring-2 focus:ring-[#b99462]/20"
                />

                {/* Summary */}
                <div className="mt-5 rounded-2xl bg-[#faf0e3] p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#b99462]">Your RSVP Summary</p>
                  <div className="space-y-1.5 text-sm text-[#3d2a14]">
                    <p><span className="font-medium">Name:</span> {name}</p>
                    <p><span className="font-medium">Attending:</span> {attending ? "Yes 🎉" : "No 😔"}</p>
                    {attending && (
                      <>
                        <p><span className="font-medium">Events:</span> {events.join(", ") || "None selected"}</p>
                        <p><span className="font-medium">Food:</span> {food === "veg" ? "Vegetarian 🥗" : "Non-Vegetarian 🍗"}</p>
                        <p><span className="font-medium">Guests:</span> {members} {members === 1 ? "person" : "people"}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setStep(attending ? "members" : "welcome")} className="flex h-12 items-center justify-center rounded-xl border border-[#e5d5bf] px-4 text-stone-600 transition hover:border-[#b99462]">
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b99462] to-[#9a7a4e] py-3.5 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(185,148,98,.4)] transition hover:opacity-90 disabled:opacity-60"
                  >
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Sparkles size={16} /> Submit RSVP</>}
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

/* ─── Sub-components ─── */
const fadeSlide = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(60,40,25,.25)] md:p-8">
      {children}
    </div>
  );
}

function StepHeader({ title, subtitle, back }: { title: string; subtitle: string; back: () => void }) {
  return (
    <div className="mb-5 text-center text-white">
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
      <p className="mt-2 text-sm text-white/55">{subtitle}</p>
    </div>
  );
}

function NavButtons({ onBack, onNext, disableNext }: { onBack: () => void; onNext: () => void; disableNext?: boolean }) {
  return (
    <div className="mt-6 flex gap-3">
      <button onClick={onBack} className="flex h-12 items-center justify-center rounded-xl border border-[#e5d5bf] px-4 text-stone-600 transition hover:border-[#b99462]">
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={onNext}
        disabled={disableNext}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b99462] to-[#9a7a4e] py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(185,148,98,.35)] transition hover:opacity-90 disabled:opacity-40"
      >
        Continue <ChevronRight size={16} />
      </button>
    </div>
  );
}

function AttendButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`rounded-xl border-2 p-3.5 text-sm font-medium transition ${active ? "border-[#b99462] bg-[#fdf6ec] text-[#7a5c2e]" : "border-[#ede6db] bg-[#faf8f5] text-stone-500 hover:border-[#d4c4a8]"}`}>
      {label}
    </button>
  );
}

function FoodCard({ active, onClick, emoji, label, sublabel, color }: { active: boolean; onClick: () => void; emoji: string; label: string; sublabel: string; color: "emerald" | "orange" }) {
  const colors = {
    emerald: { border: active ? "border-emerald-400 bg-emerald-50" : "border-[#ede6db] bg-[#faf8f5]", dot: "bg-emerald-400" },
    orange: { border: active ? "border-orange-400 bg-orange-50" : "border-[#ede6db] bg-[#faf8f5]", dot: "bg-orange-400" },
  }[color];
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-3 rounded-2xl border-2 py-6 transition ${colors.border}`}>
      <span className="text-4xl">{emoji}</span>
      <div className="text-center">
        <p className="text-sm font-semibold text-[#1d1a18]">{label}</p>
        <p className="text-xs text-stone-400">{sublabel}</p>
      </div>
      <div className={`h-2.5 w-2.5 rounded-full transition ${active ? colors.dot : "bg-stone-200"}`} />
    </button>
  );
}

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#c9a96e]"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 4 }}
        />
      ))}
    </div>
  );
}
