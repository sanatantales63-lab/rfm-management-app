"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Check,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Shirt,
  Sparkles,
  Star,
  User,
  Users,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/* ─── Form Data ─── */
interface FormData {
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  whatsapp: string;
  weddingDate: string;
  venueName: string;
  dressCode: string;
  city: string;
  events: string[];
  eventDays: string;
  guestCount: string;
  budget: string;
  packageChoice: string;
  addOns: string[];
  referralSource: string;
  preferredContact: string;
  message: string;
}

/* ─── Static Data ─── */
const ALL_EVENTS = [
  { key: "Pre Wedding", emoji: "📸" },
  { key: "Engagement", emoji: "💍" },
  { key: "Haldi", emoji: "🌿" },
  { key: "Mehndi", emoji: "🌸" },
  { key: "Sangeet", emoji: "🎶" },
  { key: "Wedding", emoji: "👑" },
  { key: "Reception", emoji: "✨" },
  { key: "Other", emoji: "🎉" },
];

const BUDGET_OPTIONS = [
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "₹2,00,000 – ₹3,50,000",
  "₹3,50,000 – ₹5,00,000",
  "₹5,00,000+ (Luxury Wedding)",
];

const PACKAGE_OPTIONS = [
  { label: "Package 01", price: "₹1,50,000" },
  { label: "Package 02", price: "₹2,50,000" },
  { label: "Package 03", price: "₹3,50,000" },
  { label: "Package 04", price: "₹5,00,000" },
  { label: "🏆 Signature Luxury", price: "₹8,00,000+" },
  { label: "Need a Custom Quote", price: "" },
];

const ADD_ONS = [
  "Drone Coverage",
  "FPV Drone",
  "Same Day Edit",
  "Live Streaming",
  "Content Creator",
  "360° Booth",
  "Selfie Booth",
  "Luxury Album",
  "Premium Guest Book",
  "Save The Date",
  "Pre Wedding Shoot",
  "None",
];

const EVENT_DAYS = ["1 Day", "2 Days", "3 Days", "4+ Days"];

const REFERRAL_SOURCES = [
  "Instagram",
  "Google",
  "Google Maps",
  "Facebook",
  "YouTube",
  "Friend / Family",
  "Planner",
  "Other",
];

const CONTACT_METHODS = ["WhatsApp", "Phone Call", "Email", "Any"];

const GUEST_COUNTS = [
  "Under 50",
  "50 – 100",
  "100 – 200",
  "200 – 400",
  "400 – 600",
  "600 – 1000",
  "1000+",
];

/* ─── Particles (stable positions) ─── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: ((i * 41) % 97) + 1.5,
  top: ((i * 67) % 95) + 2,
  size: 1.2 + (i % 3) * 1.1,
  duration: 4 + (i % 5) * 1.2,
  delay: (i % 7) * 0.7,
  color: i % 3 === 0 ? "#d4af70" : i % 3 === 1 ? "#a78bfa" : "#f9a8d4",
}));

const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  angle: (i / 30) * 360,
  distance: 80 + (i % 4) * 40,
  color: i % 4 === 0 ? "#d4af70" : i % 4 === 1 ? "#fff" : i % 4 === 2 ? "#a78bfa" : "#f9a8d4",
  size: 5 + (i % 3) * 3,
  duration: 1.2 + (i % 3) * 0.4,
}));

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export function ClientRegister({ ownerToken }: { ownerToken: string }) {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    brideName: "",
    groomName: "",
    email: "",
    phone: "",
    whatsapp: "",
    weddingDate: "",
    venueName: "",
    dressCode: "",
    city: "",
    events: [],
    eventDays: "",
    guestCount: "",
    budget: "",
    packageChoice: "",
    addOns: [],
    referralSource: "",
    preferredContact: "",
    message: "",
  });

  const set = (key: keyof FormData, value: FormData[keyof FormData]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleEvent = (key: string) =>
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(key)
        ? prev.events.filter((e) => e !== key)
        : [...prev.events, key],
    }));

  const toggleAddOn = (key: string) =>
    setForm((prev) => {
      if (key === "None") return { ...prev, addOns: ["None"] };
      const without = prev.addOns.filter((a) => a !== "None");
      return {
        ...prev,
        addOns: without.includes(key) ? without.filter((a) => a !== key) : [...without, key],
      };
    });

  const handleSubmit = async () => {
    if (!form.brideName.trim() || !form.groomName.trim()) {
      toast.error("Please enter both Bride & Groom names");
      formRef.current?.querySelector<HTMLInputElement>("#bride-name")?.focus();
      return;
    }
    if (!form.phone.trim() || !form.whatsapp.trim()) {
      toast.error("Mobile & WhatsApp numbers are required");
      return;
    }
    if (!form.weddingDate) {
      toast.error("Please select your wedding date");
      return;
    }
    if (!form.city.trim()) {
      toast.error("Please enter your wedding city");
      return;
    }
    if (!form.budget) {
      toast.error("Please select a budget range");
      return;
    }

    setSubmitting(true);
    try {
      const newEntry = {
        id: `reg-${Date.now()}`,
        initials: `${form.brideName[0] ?? "?"}${form.groomName[0] ?? "?"}`.toUpperCase(),
        clientName: `${form.brideName.split(" ")[0]} & ${form.groomName.split(" ")[0]}`,
        brideName: form.brideName,
        groomName: form.groomName,
        email: form.email,
        phone: form.phone,
        weddingDate: form.weddingDate || new Date().toISOString().split("T")[0],
        location: form.venueName
          ? `${form.venueName}${form.city ? ", " + form.city : ""}`
          : form.city || "Venue TBD",
        packageName: form.packageChoice || "TBD",
        price: 0,
        status: "planning" as const,
        portalCode: `REG${Date.now().toString().slice(-5)}`,
        dressCode: form.dressCode,
        timeline: form.events.map((ev) => ({ title: ev, date: "TBD", type: "event" as const })),
        notes: form.message,
        ownerToken,
        _isRegistration: true,
      };



      try {
        if (isSupabaseConfigured()) {
          const db = createClient();
          await db.from("client_registrations").insert([{
            bride_name: form.brideName,
            groom_name: form.groomName,
            email: form.email,
            phone: form.phone,
            whatsapp: form.whatsapp,
            wedding_date: form.weddingDate || null,
            venue: form.venueName,
            city: form.city,
            dress_code: form.dressCode,
            events: form.events,
            event_days: form.eventDays,
            guest_count: form.guestCount,
            budget: form.budget,
            package_choice: form.packageChoice,
            add_ons: form.addOns,
            referral_source: form.referralSource,
            preferred_contact: form.preferredContact,
            message: form.message,
            owner_token: ownerToken,
          }]);
        }
      } catch (err) {
        console.error("Supabase registration insert error:", err);
      }

      toast.success("Details submitted! Your photographer will be in touch soon. 💫");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── DONE ── */
  if (done) {
    return (
      <main
        className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-20 text-white"
        style={{ background: "linear-gradient(135deg, #07050f 0%, #140f22 50%, #0a0814 100%)" }}
      >
        <Particles />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.65)_100%)]" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="relative z-10 text-center"
        >
          <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
            {CONFETTI.map((c) => (
              <motion.div
                key={c.id}
                className="absolute rounded-full"
                style={{ width: c.size, height: c.size, background: c.color, top: "50%", left: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((c.angle * Math.PI) / 180) * c.distance,
                  y: Math.sin((c.angle * Math.PI) / 180) * c.distance,
                  opacity: 0, scale: 0.3,
                }}
                transition={{ duration: c.duration, ease: "easeOut", delay: 0.2 }}
              />
            ))}
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #d4af70, #9a6f2e)", boxShadow: "0 0 70px rgba(212,175,112,.6)" }}
            >
              <Heart size={48} fill="white" className="text-white" />
            </motion.div>
          </div>

          <h1 className="text-5xl font-bold md:text-6xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your details are in!
          </h1>
          <p className="mt-4 text-lg text-white/55">Your photographer will be in touch soon.</p>
          <p className="mt-2 text-sm text-white/30">We can&apos;t wait to capture your beautiful day 📸</p>

          <div className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white/40 backdrop-blur">
            <Sparkles size={14} className="text-[#d4af70]" />
            RFM Weddings
          </div>
        </motion.div>
      </main>
    );
  }

  /* ── SCROLLABLE FORM ── */
  return (
    <main
      className="relative min-h-screen text-white"
      style={{ background: "linear-gradient(160deg, #07050f 0%, #120e20 40%, #0c0918 100%)" }}
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 8% 5%, rgba(212,175,112,.22) 0, transparent 45%), radial-gradient(ellipse at 92% 85%, rgba(139,92,246,.25) 0, transparent 50%), radial-gradient(ellipse at 55% 45%, rgba(212,175,112,.04) 0, transparent 60%)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,.55)_100%)]" />
      <Particles />

      <div className="relative z-10" ref={formRef}>

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden px-5 pb-12 pt-16 text-center md:pt-20">
          <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-[#d4af70] to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 flex items-center justify-center gap-3"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #d4af70, #9a6f2e)", boxShadow: "0 0 24px rgba(212,175,112,.4)" }}
            >
              <Heart size={16} fill="white" className="text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af70]">RFM Weddings</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold leading-tight md:text-7xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Wedding{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #d4af70 0%, #f5e4a8 50%, #c9913a 100%)" }}
            >
              Inquiry Form
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-base text-white/40"
          >
            Fill in your details and we&apos;ll craft a package just for you
          </motion.p>

          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#d4af70] to-transparent" />
        </div>

        {/* ── Form Sections ── */}
        <div className="mx-auto max-w-2xl space-y-6 px-4 pb-24 md:px-8">

          {/* ══ 1. Personal Details ══ */}
          <Section icon={<User size={18} />} title="Personal Details" index={1}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Bride's Name" required>
                <Input
                  id="bride-name"
                  value={form.brideName}
                  onChange={(v) => set("brideName", v)}
                  placeholder="Bride's full name"
                />
              </FieldGroup>
              <FieldGroup label="Groom's Name" required>
                <Input
                  value={form.groomName}
                  onChange={(v) => set("groomName", v)}
                  placeholder="Groom's full name"
                />
              </FieldGroup>
              <FieldGroup label="Mobile Number" required>
                <InputWithIcon icon={<Phone size={14} />}>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    placeholder="+91 98765 43210"
                  />
                </InputWithIcon>
              </FieldGroup>
              <FieldGroup label="WhatsApp Number" required>
                <InputWithIcon icon={<MessageSquare size={14} />}>
                  <Input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(v) => set("whatsapp", v)}
                    placeholder="+91 98765 43210"
                  />
                </InputWithIcon>
              </FieldGroup>
            </div>
            <FieldGroup label="Email Address">
              <Input
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                placeholder="your@email.com (optional)"
              />
            </FieldGroup>
          </Section>

          {/* ══ 2. Wedding Details ══ */}
          <Section icon={<Calendar size={18} />} title="Wedding Details" index={2}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Wedding Date" required>
                <Input
                  type="date"
                  value={form.weddingDate}
                  onChange={(v) => set("weddingDate", v)}
                  placeholder=""
                />
              </FieldGroup>
              <FieldGroup label="Wedding Location / City" required>
                <InputWithIcon icon={<MapPin size={14} />}>
                  <Input
                    value={form.city}
                    onChange={(v) => set("city", v)}
                    placeholder="Mumbai, Jaipur, Udaipur…"
                  />
                </InputWithIcon>
              </FieldGroup>
            </div>
            <FieldGroup label="Wedding Venue">
              <InputWithIcon icon={<MapPin size={14} />}>
                <Input
                  value={form.venueName}
                  onChange={(v) => set("venueName", v)}
                  placeholder="e.g. The Leela Palace, Grand Hyatt"
                />
              </InputWithIcon>
            </FieldGroup>

            {/* Function Type */}
            <FieldGroup label="Function Type" sub="Select all that apply">
              <div className="grid grid-cols-4 gap-2.5">
                {ALL_EVENTS.map((ev) => (
                  <ToggleChip
                    key={ev.key}
                    emoji={ev.emoji}
                    label={ev.key}
                    active={form.events.includes(ev.key)}
                    onClick={() => toggleEvent(ev.key)}
                  />
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Dress Code">
              <InputWithIcon icon={<Shirt size={14} />}>
                <Input
                  value={form.dressCode}
                  onChange={(v) => set("dressCode", v)}
                  placeholder="e.g. Ivory & Gold, Ethnic wear"
                />
              </InputWithIcon>
            </FieldGroup>
          </Section>

          {/* ══ 3. Wedding Budget ══ */}
          <Section icon={<Sparkles size={18} />} title="Wedding Budget" index={3}>
            <div className="space-y-2.5">
              {BUDGET_OPTIONS.map((b) => (
                <RadioRow
                  key={b}
                  label={b}
                  selected={form.budget === b}
                  onClick={() => set("budget", b)}
                />
              ))}
            </div>
          </Section>

          {/* ══ 4. Interested Package ══ */}
          <Section icon={<Star size={18} />} title="Interested Package" index={4}>
            <div className="space-y-2.5">
              {PACKAGE_OPTIONS.map((p) => (
                <RadioRow
                  key={p.label}
                  label={p.label}
                  sub={p.price}
                  selected={form.packageChoice === p.label}
                  onClick={() => set("packageChoice", p.label)}
                  highlight={p.label.includes("Signature")}
                />
              ))}
            </div>
          </Section>

          {/* ══ 5. Add-On Services ══ */}
          <Section icon={<Video size={18} />} title="Add-On Services" index={5} sub="Optional">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {ADD_ONS.map((a) => (
                <CheckChip
                  key={a}
                  label={a}
                  active={form.addOns.includes(a)}
                  onClick={() => toggleAddOn(a)}
                />
              ))}
            </div>
          </Section>

          {/* ══ 6. Number of Event Days ══ */}
          <Section icon={<Calendar size={18} />} title="Number of Event Days" index={6}>
            <div className="grid grid-cols-4 gap-3">
              {EVENT_DAYS.map((d) => (
                <DayButton
                  key={d}
                  label={d}
                  selected={form.eventDays === d}
                  onClick={() => set("eventDays", d)}
                />
              ))}
            </div>
          </Section>

          {/* ══ 7. Additional Preferences ══ */}
          <Section icon={<Users size={18} />} title="Additional Preferences" index={7}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="Preferred Contact Method">
                <SelectInput
                  value={form.preferredContact}
                  onChange={(v) => set("preferredContact", v)}
                  options={CONTACT_METHODS}
                  placeholder="Select"
                />
              </FieldGroup>
              <FieldGroup label="Expected Guest Count">
                <SelectInput
                  value={form.guestCount}
                  onChange={(v) => set("guestCount", v)}
                  options={GUEST_COUNTS}
                  placeholder="Select"
                />
              </FieldGroup>
            </div>
          </Section>

          {/* ══ 8. How Did You Find Us ══ */}
          <Section icon={<Camera size={18} />} title="How Did You Find Us?" index={8}>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {REFERRAL_SOURCES.map((r) => (
                <ReferralChip
                  key={r}
                  label={r}
                  selected={form.referralSource === r}
                  onClick={() => set("referralSource", r)}
                />
              ))}
            </div>
          </Section>

          {/* ══ 9. Tell Us About Your Wedding ══ */}
          <Section icon={<MessageSquare size={18} />} title="Tell Us About Your Wedding" index={9} sub="Optional">
            <textarea
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Any special requirements, theme, venue details, guest count, vision for the day…"
              rows={5}
              className="w-full resize-none rounded-2xl border px-5 py-4 text-sm outline-none transition placeholder:text-white/20"
              style={{
                borderColor: "rgba(212,175,112,.18)",
                background: "rgba(212,175,112,.04)",
                color: "rgba(255,255,255,.8)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,112,.5)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,112,.08), 0 0 24px rgba(212,175,112,.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,175,112,.18)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </Section>

          {/* ══ Submit Button ══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="pt-2"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(212,175,112,.55)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="relative w-full overflow-hidden rounded-2xl py-5 text-base font-semibold text-white transition disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #d4af70 0%, #c9913a 50%, #9a6f2e 100%)",
                boxShadow: "0 8px 40px rgba(212,175,112,.4)",
              }}
            >
              {/* Shimmer */}
              <motion.div
                className="pointer-events-none absolute inset-0 -skew-x-12"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.15) 50%, transparent 100%)" }}
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              />
              <span className="relative flex items-center justify-center gap-2.5">
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting your details…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Submit My Wedding Inquiry
                    <Heart size={16} fill="white" />
                  </>
                )}
              </span>
            </motion.button>

            <p className="mt-4 text-center text-xs text-white/20">
              Your information is safe with us · RFM Weddings
            </p>
          </motion.div>

        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════
   SECTION WRAPPER
══════════════════════════════════════════════ */
function Section({
  icon,
  title,
  index,
  sub,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  index: number;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.025) 100%)",
        border: "1px solid rgba(212,175,112,.15)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 24px 64px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07)",
      }}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{
          borderBottom: "1px solid rgba(212,175,112,.1)",
          background: "rgba(212,175,112,.05)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#d4af70]"
          style={{ background: "rgba(212,175,112,.12)", border: "1px solid rgba(212,175,112,.2)" }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3
            className="text-base font-semibold text-white"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}
          >
            {title}
          </h3>
          {sub && <p className="text-[11px] text-white/30">{sub}</p>}
        </div>
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
          style={{ background: "rgba(212,175,112,.15)", color: "rgba(212,175,112,.7)" }}
        >
          {index}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

/* ── Field Group ── */
function FieldGroup({
  label,
  required,
  sub,
  children,
}: {
  label: string;
  required?: boolean;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-baseline gap-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af70]/70">
          {label}
          {required && <span className="ml-0.5 text-[#d4af70]">*</span>}
        </label>
        {sub && <span className="ml-auto text-[11px] text-white/25">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

/* ── Input ── */
function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-white/20"
      style={{ borderColor: "rgba(212,175,112,.2)", color: "rgba(255,255,255,.85)" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(212,175,112,.55)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,112,.08)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(212,175,112,.2)";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

/* ── Input with left icon ── */
function InputWithIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af70]/50">
        {icon}
      </div>
      <div className="[&_input]:pl-9">{children}</div>
    </div>
  );
}

/* ── Select ── */
function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition"
        style={{
          borderColor: "rgba(212,175,112,.2)",
          background: "transparent",
          color: value ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.25)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(212,175,112,.55)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,112,.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(212,175,112,.2)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <option value="" disabled style={{ background: "#140f22" }}>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#140f22", color: "white" }}>{o}</option>
        ))}
      </select>
      {/* Custom chevron */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="rgba(212,175,112,.5)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/* ── Event Toggle Chip ── */
function ToggleChip({ emoji, label, active, onClick }: { emoji: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-2xl border py-3.5 text-center transition"
      style={{
        borderColor: active ? "rgba(212,175,112,.6)" : "rgba(212,175,112,.12)",
        background: active ? "rgba(212,175,112,.15)" : "rgba(255,255,255,.02)",
        boxShadow: active ? "0 0 16px rgba(212,175,112,.2), inset 0 0 12px rgba(212,175,112,.06)" : "none",
      }}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="text-[10px] font-semibold leading-tight" style={{ color: active ? "#d4af70" : "rgba(255,255,255,.4)" }}>
        {label}
      </span>
      <div
        className="flex h-4 w-4 items-center justify-center rounded-full border transition"
        style={{
          borderColor: active ? "#d4af70" : "rgba(255,255,255,.15)",
          background: active ? "#d4af70" : "transparent",
        }}
      >
        {active && <Check size={9} strokeWidth={3} className="text-[#07050f]" />}
      </div>
    </button>
  );
}

/* ── Checkbox Chip ── */
function CheckChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition"
      style={{
        borderColor: active ? "rgba(212,175,112,.55)" : "rgba(212,175,112,.12)",
        background: active ? "rgba(212,175,112,.12)" : "rgba(255,255,255,.02)",
        boxShadow: active ? "0 0 12px rgba(212,175,112,.18)" : "none",
      }}
    >
      <div
        className="flex h-4 w-4 shrink-0 items-center justify-center transition"
        style={{
          borderRadius: 4,
          border: `1.5px solid ${active ? "#d4af70" : "rgba(255,255,255,.2)"}`,
          background: active ? "#d4af70" : "transparent",
        }}
      >
        {active && <Check size={9} strokeWidth={3} className="text-[#07050f]" />}
      </div>
      <span className="text-[11px] font-medium" style={{ color: active ? "#d4af70" : "rgba(255,255,255,.45)" }}>
        {label}
      </span>
    </button>
  );
}

/* ── Radio Row ── */
function RadioRow({
  label,
  sub,
  selected,
  onClick,
  highlight,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border px-5 py-3.5 text-left transition"
      style={{
        borderColor: selected
          ? highlight ? "rgba(212,175,112,.9)" : "rgba(212,175,112,.6)"
          : highlight ? "rgba(212,175,112,.25)" : "rgba(212,175,112,.12)",
        background: selected
          ? highlight ? "rgba(212,175,112,.18)" : "rgba(212,175,112,.1)"
          : highlight ? "rgba(212,175,112,.05)" : "rgba(255,255,255,.02)",
        boxShadow: selected
          ? "0 0 20px rgba(212,175,112,.2), inset 0 0 16px rgba(212,175,112,.06)"
          : "none",
      }}
    >
      {/* Radio dot */}
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
        style={{
          borderColor: selected ? "#d4af70" : "rgba(255,255,255,.2)",
          background: selected ? "#d4af70" : "transparent",
        }}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-[#07050f]" />}
      </div>
      <span
        className="flex-1 text-sm font-medium"
        style={{ color: selected ? (highlight ? "#f5e4a8" : "#d4af70") : "rgba(255,255,255,.6)" }}
      >
        {label}
      </span>
      {sub && (
        <span
          className="text-xs font-semibold"
          style={{ color: selected ? "rgba(212,175,112,.9)" : "rgba(255,255,255,.25)" }}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

/* ── Day Button ── */
function DayButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border py-4 text-sm font-semibold transition"
      style={{
        borderColor: selected ? "rgba(212,175,112,.7)" : "rgba(212,175,112,.15)",
        background: selected ? "rgba(212,175,112,.18)" : "rgba(255,255,255,.02)",
        color: selected ? "#d4af70" : "rgba(255,255,255,.4)",
        boxShadow: selected ? "0 0 20px rgba(212,175,112,.25)" : "none",
      }}
    >
      {label}
    </button>
  );
}

/* ── Referral Chip ── */
function ReferralChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border py-3 text-xs font-semibold transition"
      style={{
        borderColor: selected ? "rgba(212,175,112,.65)" : "rgba(212,175,112,.12)",
        background: selected ? "rgba(212,175,112,.15)" : "rgba(255,255,255,.02)",
        color: selected ? "#d4af70" : "rgba(255,255,255,.4)",
        boxShadow: selected ? "0 0 14px rgba(212,175,112,.2)" : "none",
      }}
    >
      {label}
    </button>
  );
}

/* ── Ambient Particles ── */
function Particles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.45, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
