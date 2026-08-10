"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowLeft, BookOpen, Camera, Check, ChevronDown, ChevronRight, ChevronUp,
  Copy, ExternalLink, Eye, EyeOff, Film, Globe, Heart, Image as ImageIcon,
  Instagram, Mail, MapPin, Minus, Pencil, Phone, Plane, PlayCircle, Plus,
  Send, Sparkles, Star, Trash2, Users, Zap, FileText, Loader2,
  GripVertical, X, Search, Music, Gift, Clock, Calendar, Shield,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
/* ══════════════════════════════════════════════════════
   PROPOSAL MOODS — Premium dark themes for public page
══════════════════════════════════════════════════════ */
export const PROPOSAL_MOODS: Record<string, {
  label: string; emoji: string;
  bg: string; surface: string; border: string;
  accent: string; accentRgb: string; glow: string;
  text: string; muted: string; cardBg: string;
  gradientHero: string; gradientCard: string; preview: string;
}> = {
  "golden-noir": {
    label: "Golden Noir", emoji: "✨",
    bg: "#080604", surface: "rgba(201,169,110,0.07)", border: "rgba(201,169,110,0.16)",
    accent: "#c9a96e", accentRgb: "201,169,110", glow: "rgba(201,169,110,0.25)",
    text: "#f5f0e8", muted: "rgba(245,240,232,0.45)", cardBg: "rgba(255,255,255,0.03)",
    gradientHero: "radial-gradient(ellipse at 30% 20%, rgba(201,169,110,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(201,169,110,0.10) 0%, transparent 50%)",
    gradientCard: "linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(201,169,110,0.02) 100%)",
    preview: "linear-gradient(135deg, #1a1208 0%, #0f0a06 100%)",
  },
  "rose-dust": {
    label: "Rose Dust", emoji: "🌹",
    bg: "#090507", surface: "rgba(210,130,110,0.07)", border: "rgba(210,130,110,0.16)",
    accent: "#d4876a", accentRgb: "212,135,106", glow: "rgba(212,135,106,0.25)",
    text: "#fdf0ee", muted: "rgba(253,240,238,0.45)", cardBg: "rgba(255,255,255,0.03)",
    gradientHero: "radial-gradient(ellipse at 30% 20%, rgba(212,135,106,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(212,135,106,0.10) 0%, transparent 50%)",
    gradientCard: "linear-gradient(135deg, rgba(212,135,106,0.08) 0%, rgba(212,135,106,0.02) 100%)",
    preview: "linear-gradient(135deg, #1e0f12 0%, #0f0608 100%)",
  },
  "emerald-night": {
    label: "Emerald Night", emoji: "🌿",
    bg: "#050b07", surface: "rgba(80,180,120,0.07)", border: "rgba(80,180,120,0.16)",
    accent: "#5fc484", accentRgb: "95,196,132", glow: "rgba(95,196,132,0.25)",
    text: "#f0fdf5", muted: "rgba(240,253,245,0.45)", cardBg: "rgba(255,255,255,0.03)",
    gradientHero: "radial-gradient(ellipse at 30% 20%, rgba(95,196,132,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(95,196,132,0.10) 0%, transparent 50%)",
    gradientCard: "linear-gradient(135deg, rgba(95,196,132,0.08) 0%, rgba(95,196,132,0.02) 100%)",
    preview: "linear-gradient(135deg, #0d1e12 0%, #060e09 100%)",
  },
  "pearl-day": {
    label: "Pearl Day", emoji: "🤍",
    bg: "#faf8f4", surface: "rgba(100,80,55,0.06)", border: "rgba(100,80,55,0.13)",
    accent: "#7a5c3a", accentRgb: "122,92,58", glow: "rgba(122,92,58,0.2)",
    text: "#1c160f", muted: "rgba(28,22,15,0.5)", cardBg: "rgba(255,255,255,0.7)",
    gradientHero: "radial-gradient(ellipse at 30% 20%, rgba(122,92,58,0.1) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(122,92,58,0.06) 0%, transparent 50%)",
    gradientCard: "linear-gradient(135deg, rgba(122,92,58,0.06) 0%, rgba(122,92,58,0.02) 100%)",
    preview: "linear-gradient(135deg, #f0ebe2 0%, #faf8f4 100%)",
  },
};
import {
  getProposals, getProposalBySlug, saveProposal, deleteProposal, togglePublish,
  DEFAULT_PROPOSAL,
  type Proposal, type CoverageDay, type Deliverable, type SmartFeature,
  type FaqItem, type CustomField, type ProposalInvestment, type ProposalContact,
} from "@/services/proposals";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/* ══════════════════════════════════════════════════════
   ICON REGISTRY — for deliverable / custom field pickers
══════════════════════════════════════════════════════ */
export const ICON_MAP: Record<string, React.ElementType> = {
  Film, PlayCircle, BookOpen, Image: ImageIcon, Camera, Users, Star, Heart,
  Globe, Plane, Gift, Clock, Calendar, Shield, Sparkles, Music, Zap, MapPin,
  Phone, Mail, Instagram, FileText, Send,
};

function DynamicIcon({ name, ...props }: { name: string } & React.ComponentProps<typeof Film>) {
  const Icon = ICON_MAP[name] ?? Star;
  return <Icon {...props} />;
}

/* ══════════════════════════════════════════════════════
   SHARED UI HELPERS
══════════════════════════════════════════════════════ */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-sm font-semibold">{children}</span>;
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

function CardBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 ${className}`}>
      {children}
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-champagne hover:underline"
    >
      <Plus size={13} /> {label}
    </button>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:border-champagne transition"
      >
        <DynamicIcon name={value} size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute left-0 top-12 z-50 grid grid-cols-5 gap-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-xl"
          >
            {Object.keys(ICON_MAP).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { onChange(k); setOpen(false); }}
                className={`grid h-9 w-9 place-items-center rounded-xl transition hover:bg-champagne hover:text-white ${value === k ? "bg-champagne text-white" : "bg-[hsl(var(--muted))]"}`}
                title={k}
              >
                <DynamicIcon name={k} size={15} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROPOSALS LIST VIEW
══════════════════════════════════════════════════════ */
export function ProposalsView() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProposals();
    setProposals(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Delete proposal for ${name}?`)) return;
    const ok = await deleteProposal(slug);
    if (ok) { toast.success("Proposal deleted"); load(); }
    else toast.error("Failed to delete");
  };

  const handleToggle = async (slug: string, current: boolean) => {
    const ok = await togglePublish(slug, !current);
    if (ok) {
      toast.success(current ? "Proposal unpublished" : "Proposal published & link is live!");
      load();
    } else toast.error("Failed to update");
  };

  return (
    <div className="mx-auto max-w-7xl p-5 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Client storytelling</p>
          <h1 className="mt-1 font-display text-3xl">Proposals</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Create personalised, shareable proposal webpages for each couple.
          </p>
        </div>
        <Link href="/proposals/new">
          <Button><Plus size={16} />Create proposal</Button>
        </Link>
      </div>

      {!isSupabaseConfigured() && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
          ⚠️ Supabase is not configured. Proposals will not be saved. Please set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-champagne" size={32} />
        </div>
      ) : (
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Create card */}
          <Link
            href="/proposals/new"
            className="group grid min-h-80 place-items-center rounded-3xl border border-dashed border-champagne/50 bg-champagne/5 text-center transition hover:bg-champagne/10"
          >
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-champagne text-white shadow-glow">
                <Plus size={22} />
              </div>
              <p className="mt-4 font-semibold">Begin a new proposal</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Personalised page for your couple
              </p>
            </div>
          </Link>

          {proposals.map((p) => {
            const mood = PROPOSAL_MOODS[p.theme] ?? PROPOSAL_MOODS["golden-noir"];
            const link = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${p.slug}`;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl shadow-soft"
                style={{ background: mood.preview }}
              >
                {/* Preview header */}
                <div className="relative h-48 px-6 py-6">
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: `radial-gradient(ellipse at 80% 20%, ${mood.accent}40 0, transparent 60%)` }}
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm italic" style={{ color: mood.accent }}>
                        {mood.emoji} Wedding Proposal
                      </p>
                      <p className="mt-3 font-display text-3xl" style={{ color: mood.text }}>
                        {p.bride_name} <span style={{ color: mood.accent }}>&</span> {p.groom_name}
                      </p>
                      <p className="mt-2 text-[10px] tracking-[.18em]" style={{ color: mood.muted }}>
                        {p.wedding_dates.join(" · ") || "DATES TBD"}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: `${mood.accent}25`, color: mood.accent }}
                    >
                      {p.is_published ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Actions bar */}
                <div
                  className="flex items-center justify-between border-t bg-white p-4 text-ink dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--foreground))]"
                  style={{ borderColor: `${mood.accent}20` }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{p.bride_name} & {p.groom_name}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-[hsl(var(--muted-foreground))]">
                      {p.is_published ? "Published · Live" : "Draft"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {/* Toggle publish */}
                    <button
                      onClick={() => handleToggle(p.slug, p.is_published)}
                      title={p.is_published ? "Unpublish" : "Publish"}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition hover:bg-emerald-100 hover:text-emerald-600 dark:bg-[hsl(var(--muted))] dark:text-[hsl(var(--muted-foreground))]"
                    >
                      {p.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(p.slug, `${p.bride_name} & ${p.groom_name}`)}
                      title="Delete"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-500 transition hover:bg-red-100 hover:text-red-600 dark:bg-[hsl(var(--muted))] dark:text-[hsl(var(--muted-foreground))]"
                    >
                      <Trash2 size={15} />
                    </button>
                    {/* Copy link */}
                    <button
                      onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied!"); }}
                      title="Copy link"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition hover:bg-champagne hover:text-white dark:bg-[hsl(var(--muted))]"
                    >
                      <Copy size={15} />
                    </button>
                    {/* Edit */}
                    <Link
                      href={`/proposals/${p.slug}/edit`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 transition hover:bg-champagne hover:text-white dark:bg-[hsl(var(--muted))]"
                    >
                      <ChevronRight size={17} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROPOSAL BUILDER
══════════════════════════════════════════════════════ */
type BuilderStep = "basics" | "coverage" | "investment" | "deliverables" | "features" | "terms" | "faq" | "contact" | "custom";

const STEPS: { id: BuilderStep; label: string; icon: React.ElementType }[] = [
  { id: "basics",      label: "Basics",       icon: Heart },
  { id: "coverage",    label: "Coverage",     icon: Camera },
  { id: "investment",  label: "Investment",   icon: Star },
  { id: "deliverables",label: "Deliverables", icon: Film },
  { id: "features",   label: "Smart Tech",    icon: Zap },
  { id: "terms",      label: "Terms",         icon: Shield },
  { id: "faq",        label: "FAQ",           icon: Search },
  { id: "contact",    label: "Contact",       icon: Phone },
  { id: "custom",     label: "Custom Sections", icon: Plus },
];

export function ProposalBuilder({ existingSlug }: { existingSlug?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<BuilderStep>("basics");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedSlug, setSavedSlug] = useState("");
  const [loading, setLoading] = useState(Boolean(existingSlug));

  // Form state
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingDates, setWeddingDates] = useState<string[]>([""]);
  const [tagline, setTagline] = useState(DEFAULT_PROPOSAL.tagline);
  const [theme, setTheme] = useState<string>("golden-noir");
  const [coverage, setCoverage] = useState<CoverageDay[]>(DEFAULT_PROPOSAL.coverage);
  const [investment, setInvestment] = useState<ProposalInvestment>(DEFAULT_PROPOSAL.investment);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(DEFAULT_PROPOSAL.deliverables);
  const [smartFeatures, setSmartFeatures] = useState<SmartFeature[]>(DEFAULT_PROPOSAL.smart_features);
  const [terms, setTerms] = useState<string[]>(DEFAULT_PROPOSAL.terms);
  const [faq, setFaq] = useState<FaqItem[]>(DEFAULT_PROPOSAL.faq);
  const [contact, setContact] = useState<ProposalContact>(DEFAULT_PROPOSAL.contact);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Load existing proposal
  useEffect(() => {
    if (!existingSlug) return;
    (async () => {
      const p = await getProposalBySlug(existingSlug);
      if (!p) { toast.error("Proposal not found"); router.push("/proposals"); return; }
      setBrideName(p.bride_name);
      setGroomName(p.groom_name);
      setWeddingDates(p.wedding_dates.length ? p.wedding_dates : [""]);
      setTagline(p.tagline);
      setTheme(p.theme || "golden-noir");
      setCoverage(p.coverage.length ? p.coverage : DEFAULT_PROPOSAL.coverage);
      setInvestment({ ...DEFAULT_PROPOSAL.investment, ...p.investment });
      setDeliverables(p.deliverables.length ? p.deliverables : DEFAULT_PROPOSAL.deliverables);
      setSmartFeatures(p.smart_features.length ? p.smart_features : DEFAULT_PROPOSAL.smart_features);
      setTerms(p.terms.length ? p.terms : DEFAULT_PROPOSAL.terms);
      setFaq(p.faq.length ? p.faq : DEFAULT_PROPOSAL.faq);
      setContact({ ...DEFAULT_PROPOSAL.contact, ...p.contact });
      setCustomFields(p.custom_fields || []);
      setLoading(false);
    })();
  }, [existingSlug, router]);

  const handleSave = async (publish = false) => {
    if (!brideName.trim() || !groomName.trim()) {
      toast.error("Please enter bride and groom names");
      setStep("basics");
      return;
    }
    setSaving(true);
    const slug = existingSlug ||
      `${brideName.trim().toLowerCase()}-${groomName.trim().toLowerCase()}-${Math.random().toString(36).slice(2,8)}`
        .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const payload = {
      slug,
      bride_name: brideName.trim(),
      groom_name: groomName.trim(),
      wedding_dates: weddingDates.filter(Boolean),
      tagline,
      coverage,
      investment,
      deliverables,
      smart_features: smartFeatures,
      terms,
      faq,
      contact,
      custom_fields: customFields,
      theme,
      is_published: publish,
    };

    const result = await saveProposal(payload);
    setSaving(false);
    if (!result && isSupabaseConfigured()) { toast.error("Failed to save proposal"); return; }
    setSavedSlug(slug);
    setSaved(true);
    toast.success(publish ? "Proposal published & link is live! 🎉" : "Proposal saved as draft");
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-champagne" size={32} /></div>;
  }

  if (saved) {
    const link = `${window.location.origin}/p/${savedSlug}`;
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="surface p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Send size={28} />
          </div>
          <h1 className="mt-5 font-display text-3xl">Proposal ready!</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Your personalised proposal page for <strong>{brideName} & {groomName}</strong> is ready to share.
          </p>
          <div className="mt-6 rounded-2xl bg-[hsl(var(--muted))] p-4 text-left">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Shareable link</p>
            <p className="mt-1 break-all text-sm font-medium">{link}</p>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href={`/p/${savedSlug}`} target="_blank">
              <Button><ExternalLink size={16} />Preview page</Button>
            </Link>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied!"); }}>
              <Copy size={16} />Copy link
            </Button>
            <Button variant="outline" onClick={() => router.push("/proposals")}>
              <ChevronRight size={16} />All proposals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // theme is now a PROPOSAL_MOODS key — used only for public page render

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <Link href="/proposals" className="text-sm text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">
        ← Proposals
      </Link>
      <div className="mt-5 mb-7 flex items-center justify-between">
        <div>
          <p className="eyebrow">{existingSlug ? "Edit proposal" : "New proposal"}</p>
          <h1 className="mt-1 font-display text-3xl">
            {brideName && groomName ? `${brideName} & ${groomName}` : "Create proposal"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            Save draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            Publish & get link
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar stepper */}
        <nav className="space-y-1">
          {STEPS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setStep(id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                step === id
                  ? "bg-ink text-white shadow-glow dark:bg-champagne dark:text-ink"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              }`}
            >
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>

        {/* Main panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === "basics" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">Couple & Event Basics</h2>
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Bride name">
                      <Input value={brideName} onChange={e => setBrideName(e.target.value)} placeholder="Roopali" />
                    </FieldRow>
                    <FieldRow label="Groom name">
                      <Input value={groomName} onChange={e => setGroomName(e.target.value)} placeholder="Raghav" />
                    </FieldRow>
                  </div>

                  <div>
                    <SectionLabel>Wedding date(s)</SectionLabel>
                    <div className="space-y-2">
                      {weddingDates.map((d, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={d}
                            onChange={e => setWeddingDates(weddingDates.map((v, j) => j === i ? e.target.value : v))}
                            placeholder={`Day ${i + 1}: e.g. 25 January 2027`}
                          />
                          {weddingDates.length > 1 && (
                            <button type="button" onClick={() => setWeddingDates(weddingDates.filter((_, j) => j !== i))}
                              className="text-stone-400 hover:text-red-500 transition"><Minus size={16} /></button>
                          )}
                        </div>
                      ))}
                      <AddBtn onClick={() => setWeddingDates([...weddingDates, ""])} label="Add another date" />
                    </div>
                  </div>

                  <FieldRow label="Opening tagline">
                    <textarea
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2.5 text-sm outline-none resize-none focus:border-champagne"
                    />
                  </FieldRow>

                  {/* Mood picker */}
                  <div>
                    <SectionLabel>Proposal Mood</SectionLabel>
                    <p className="mb-3 text-xs text-[hsl(var(--muted-foreground))]">Choose the visual feel of the shareable proposal page.</p>
                    <div className="grid gap-3 grid-cols-2">
                      {Object.entries(PROPOSAL_MOODS).map(([key, m]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setTheme(key)}
                          className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${
                            theme === key ? "border-champagne shadow-lg" : "border-transparent hover:border-champagne/30"
                          }`}
                          style={{ background: m.preview }}
                        >
                          {theme === key && (
                            <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-champagne">
                              <Check size={11} className="text-white" />
                            </div>
                          )}
                          <span className="text-2xl">{m.emoji}</span>
                          <p className="mt-2 text-sm font-semibold" style={{ color: m.accent }}>{m.label}</p>
                          <div className="mt-2 flex gap-1">
                            <div className="h-1 flex-1 rounded-full" style={{ background: m.accent, opacity: 0.8 }} />
                            <div className="h-1 flex-1 rounded-full" style={{ background: m.accent, opacity: 0.4 }} />
                            <div className="h-1 flex-1 rounded-full" style={{ background: m.accent, opacity: 0.2 }} />
                          </div>
                          <p className="mt-2 text-[10px]" style={{ color: m.muted }}>{m.label === 'Pearl Day' ? 'Light · Elegant · Minimal' : 'Dark · Premium · Cinematic'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardBox>
            )}

            {step === "coverage" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">Coverage Days & Crew</h2>
                <div className="space-y-5">
                  {coverage.map((day, di) => (
                    <div key={di} className="rounded-2xl border border-[hsl(var(--border))] p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-champagne/10 text-champagne font-bold text-sm">{di + 1}</div>
                        <div className="flex-1 grid gap-2 sm:grid-cols-2">
                          <Input
                            value={day.day}
                            onChange={e => setCoverage(coverage.map((d, i) => i === di ? { ...d, day: e.target.value } : d))}
                            placeholder="Day 1"
                          />
                          <Input
                            value={day.subtitle}
                            onChange={e => setCoverage(coverage.map((d, i) => i === di ? { ...d, subtitle: e.target.value } : d))}
                            placeholder="Haldi | Mehndi | Sangeet"
                          />
                        </div>
                        {coverage.length > 1 && (
                          <button type="button" onClick={() => setCoverage(coverage.filter((_, i) => i !== di))}
                            className="text-stone-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
                        )}
                      </div>
                      <div className="mt-3 ml-11 space-y-2">
                        {day.crew.map((member, ci) => (
                          <div key={ci} className="flex gap-2">
                            <Input
                              value={member}
                              onChange={e => setCoverage(coverage.map((d, i) => i === di ? { ...d, crew: d.crew.map((c, j) => j === ci ? e.target.value : c) } : d))}
                              placeholder="1 Candid Photographer"
                              className="text-sm"
                            />
                            <button type="button"
                              onClick={() => setCoverage(coverage.map((d, i) => i === di ? { ...d, crew: d.crew.filter((_, j) => j !== ci) } : d))}
                              className="text-stone-400 hover:text-red-500 transition"><Minus size={15} /></button>
                          </div>
                        ))}
                        <AddBtn
                          onClick={() => setCoverage(coverage.map((d, i) => i === di ? { ...d, crew: [...d.crew, ""] } : d))}
                          label="Add crew member"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCoverage([...coverage, { day: `Day ${coverage.length + 1}`, subtitle: "", crew: [""] }])}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-champagne/50 py-4 text-sm font-medium text-champagne hover:bg-champagne/5 transition"
                  >
                    <Plus size={16} />Add another day
                  </button>
                </div>
              </CardBox>
            )}

            {step === "investment" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">Investment & Payment</h2>
                <div className="space-y-5">
                  <FieldRow label="Total investment (₹)">
                    <Input
                      type="number"
                      value={investment.total}
                      onChange={e => setInvestment({ ...investment, total: Number(e.target.value) })}
                      placeholder="150000"
                    />
                  </FieldRow>
                  <FieldRow label="Package description">
                    <Input
                      value={investment.description}
                      onChange={e => setInvestment({ ...investment, description: e.target.value })}
                      placeholder="Complete two-day photography & cinematography coverage"
                    />
                  </FieldRow>
                  <div>
                    <SectionLabel>Payment schedule (%)</SectionLabel>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {(["advance", "weddingDay", "balance"] as const).map((key) => (
                        <div key={key} className="rounded-xl border border-[hsl(var(--border))] p-4">
                          <p className="mb-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                            {key === "advance" ? "Advance" : key === "weddingDay" ? "Wedding Day" : "Balance"}
                          </p>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={0} max={100}
                              value={investment[key]}
                              onChange={e => setInvestment({ ...investment, [key]: Number(e.target.value) })}
                              className="text-lg font-bold"
                            />
                            <span className="text-xl font-bold text-champagne">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                      Total: {investment.advance + investment.weddingDay + investment.balance}% (should equal 100%)
                    </p>
                  </div>
                </div>
              </CardBox>
            )}

            {step === "deliverables" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">Deliverables</h2>
                <div className="space-y-5">
                  {deliverables.map((cat, di) => (
                    <div key={di} className="rounded-2xl border border-[hsl(var(--border))] p-4">
                      <div className="flex items-center gap-3">
                        <IconPicker value={cat.icon} onChange={icon => setDeliverables(deliverables.map((d, i) => i === di ? { ...d, icon } : d))} />
                        <Input
                          value={cat.category}
                          onChange={e => setDeliverables(deliverables.map((d, i) => i === di ? { ...d, category: e.target.value } : d))}
                          placeholder="Category name"
                          className="flex-1"
                        />
                        <button type="button" onClick={() => setDeliverables(deliverables.filter((_, i) => i !== di))}
                          className="text-stone-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
                      </div>
                      <div className="mt-3 ml-14 space-y-2">
                        {cat.items.map((item, ii) => (
                          <div key={ii} className="flex gap-2">
                            <Input
                              value={item}
                              onChange={e => setDeliverables(deliverables.map((d, i) => i === di ? { ...d, items: d.items.map((it, j) => j === ii ? e.target.value : it) } : d))}
                              placeholder="Deliverable item"
                              className="text-sm"
                            />
                            <button type="button"
                              onClick={() => setDeliverables(deliverables.map((d, i) => i === di ? { ...d, items: d.items.filter((_, j) => j !== ii) } : d))}
                              className="text-stone-400 hover:text-red-500 transition"><Minus size={15} /></button>
                          </div>
                        ))}
                        <AddBtn
                          onClick={() => setDeliverables(deliverables.map((d, i) => i === di ? { ...d, items: [...d.items, ""] } : d))}
                          label="Add item"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDeliverables([...deliverables, { category: "", icon: "Star", items: [""] }])}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-champagne/50 py-4 text-sm font-medium text-champagne hover:bg-champagne/5 transition"
                  >
                    <Plus size={16} />Add category
                  </button>
                </div>
              </CardBox>
            )}

            {step === "features" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">Smart Technology Features</h2>
                <div className="space-y-4">
                  {smartFeatures.map((f, i) => (
                    <div key={i} className="rounded-2xl border border-[hsl(var(--border))] p-4">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={f.title}
                            onChange={e => setSmartFeatures(smartFeatures.map((sf, j) => j === i ? { ...sf, title: e.target.value } : sf))}
                            placeholder="Feature title"
                          />
                          <Input
                            value={f.desc}
                            onChange={e => setSmartFeatures(smartFeatures.map((sf, j) => j === i ? { ...sf, desc: e.target.value } : sf))}
                            placeholder="Feature description"
                          />
                        </div>
                        <button type="button" onClick={() => setSmartFeatures(smartFeatures.filter((_, j) => j !== i))}
                          className="self-start text-stone-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  <AddBtn onClick={() => setSmartFeatures([...smartFeatures, { title: "", desc: "" }])} label="Add feature" />
                </div>
              </CardBox>
            )}

            {step === "terms" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">Terms & Conditions</h2>
                <div className="space-y-3">
                  {terms.map((term, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="mt-2.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-champagne/40 text-champagne text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <textarea
                        value={term}
                        onChange={e => setTerms(terms.map((t, j) => j === i ? e.target.value : t))}
                        rows={2}
                        className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none resize-none focus:border-champagne"
                      />
                      <button type="button" onClick={() => setTerms(terms.filter((_, j) => j !== i))}
                        className="self-start mt-1 text-stone-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
                    </div>
                  ))}
                  <AddBtn onClick={() => setTerms([...terms, ""])} label="Add term" />
                </div>
              </CardBox>
            )}

            {step === "faq" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">FAQ Section</h2>
                <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
                  FAQ is always shown at the bottom of the proposal page as a fixed accordion.
                </p>
                <div className="space-y-4">
                  {faq.map((item, i) => (
                    <div key={i} className="rounded-2xl border border-[hsl(var(--border))] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={item.q}
                            onChange={e => setFaq(faq.map((f, j) => j === i ? { ...f, q: e.target.value } : f))}
                            placeholder="Question..."
                          />
                          <textarea
                            value={item.a}
                            onChange={e => setFaq(faq.map((f, j) => j === i ? { ...f, a: e.target.value } : f))}
                            rows={2}
                            placeholder="Answer..."
                            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none resize-none focus:border-champagne"
                          />
                        </div>
                        <button type="button" onClick={() => setFaq(faq.filter((_, j) => j !== i))}
                          className="text-stone-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  <AddBtn onClick={() => setFaq([...faq, { q: "", a: "" }])} label="Add FAQ" />
                </div>
              </CardBox>
            )}

            {step === "contact" && (
              <CardBox>
                <h2 className="mb-5 font-display text-xl">Contact Information</h2>
                <div className="space-y-4">
                  <FieldRow label="Phone number">
                    <div className="flex gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-champagne">
                        <Phone size={16} />
                      </div>
                      <Input
                        value={contact.phone}
                        onChange={e => setContact({ ...contact, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </FieldRow>
                  <FieldRow label="Email address">
                    <div className="flex gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-champagne">
                        <Mail size={16} />
                      </div>
                      <Input
                        value={contact.email}
                        onChange={e => setContact({ ...contact, email: e.target.value })}
                        placeholder="hello@rfmphotography.com"
                      />
                    </div>
                  </FieldRow>
                  <FieldRow label="Instagram handle">
                    <div className="flex gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-champagne">
                        <Instagram size={16} />
                      </div>
                      <Input
                        value={contact.instagram}
                        onChange={e => setContact({ ...contact, instagram: e.target.value })}
                        placeholder="@rfmphotography"
                      />
                    </div>
                  </FieldRow>
                </div>
              </CardBox>
            )}

            {step === "custom" && (
              <CardBox>
                <h2 className="mb-2 font-display text-xl">Custom Sections</h2>
                <p className="mb-5 text-sm text-[hsl(var(--muted-foreground))]">
                  Add your own sections with a custom icon, title, and content.
                </p>
                <div className="space-y-4">
                  {customFields.map((cf, i) => (
                    <div key={i} className="rounded-2xl border border-[hsl(var(--border))] p-4">
                      <div className="flex items-start gap-3">
                        <IconPicker value={cf.icon} onChange={icon => setCustomFields(customFields.map((c, j) => j === i ? { ...c, icon } : c))} />
                        <div className="flex-1 space-y-2">
                          <Input
                            value={cf.label}
                            onChange={e => setCustomFields(customFields.map((c, j) => j === i ? { ...c, label: e.target.value } : c))}
                            placeholder="Section title"
                          />
                          <textarea
                            value={cf.content}
                            onChange={e => setCustomFields(customFields.map((c, j) => j === i ? { ...c, content: e.target.value } : c))}
                            rows={3}
                            placeholder="Section content..."
                            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none resize-none focus:border-champagne"
                          />
                        </div>
                        <button type="button" onClick={() => setCustomFields(customFields.filter((_, j) => j !== i))}
                          className="text-stone-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomFields([...customFields, { label: "", icon: "Star", content: "" }])}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-champagne/50 py-4 text-sm font-medium text-champagne hover:bg-champagne/5 transition"
                  >
                    <Plus size={16} />Add custom section
                  </button>
                </div>
              </CardBox>
            )}

            {/* Bottom nav */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const idx = STEPS.findIndex(s => s.id === step);
                  if (idx > 0) setStep(STEPS[idx - 1].id);
                }}
                className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition disabled:opacity-40"
                disabled={step === STEPS[0].id}
              >
                <ArrowLeft size={15} />Previous
              </button>
              {step !== STEPS[STEPS.length - 1].id ? (
                <Button
                  type="button"
                  onClick={() => {
                    const idx = STEPS.findIndex(s => s.id === step);
                    setStep(STEPS[idx + 1].id);
                  }}
                >
                  Next<ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={() => handleSave(true)} disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                  Publish & get link
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PREMIUM PUBLIC PROPOSAL PAGE
══════════════════════════════════════════════════════ */

function RevealUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GoldLine() {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1" style={{ background: "rgba(201,169,110,0.15)" }} />
      <div className="h-1 w-1 rounded-full" style={{ background: "rgba(201,169,110,0.4)" }} />
      <div className="h-px flex-1" style={{ background: "rgba(201,169,110,0.15)" }} />
    </div>
  );
}

function PremiumFaq({ items, m }: { items: FaqItem[]; m: typeof PROPOSAL_MOODS["golden-noir"] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div key={i} layout className="overflow-hidden rounded-2xl" style={{ background: m.surface, border: `1px solid ${m.border}` }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-6 py-5 text-left"
          >
            <span className="pr-4 text-base font-semibold leading-snug" style={{ color: m.text }}>{item.q}</span>
            <motion.div
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: open === i ? m.accent : m.surface, border: `1px solid ${m.border}` }}
            >
              <Plus size={14} style={{ color: open === i ? m.bg : m.accent }} />
            </motion.div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: m.muted }}>{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function CountUp({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1400;
    const step = 16;
    const inc = to / (dur / step);
    const t = setInterval(() => {
      start = Math.min(start + inc, to);
      setVal(Math.floor(start));
      if (start >= to) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

export function ProposalPublicPage({ proposal }: { proposal: Proposal }) {
  const m = PROPOSAL_MOODS[proposal.theme] ?? PROPOSAL_MOODS["golden-noir"];
  const [activeSection, setActiveSection] = useState("hero");
  const [navOpen, setNavOpen] = useState(false);

  const navSections = [
    { id: "hero",         label: "Home" },
    { id: "coverage",     label: "Coverage" },
    { id: "investment",   label: "Investment" },
    { id: "deliverables", label: "Deliverables" },
    ...(proposal.smart_features?.length ? [{ id: "features", label: "Smart Tech" }] : []),
    ...(proposal.custom_fields?.length  ? [{ id: "custom",   label: "More" }] : []),
    { id: "terms",   label: "Terms" },
    { id: "faq",     label: "FAQ" },
    { id: "contact", label: "Confirm Dates" },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setNavOpen(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25 }
    );
    navSections.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const totalCrew = proposal.coverage.reduce((a, d) => a + d.crew.length, 0);
  const totalDays = proposal.coverage.length;
  const contactHref = proposal.contact.phone
    ? `tel:${proposal.contact.phone}`
    : `mailto:${proposal.contact.email}`;

  return (
    <div style={{ background: m.bg, color: m.text, fontFamily: "'Cormorant Garamond', Georgia, serif", minHeight: "100vh" }}>

      {/* ── Keyframe styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .prop-body { font-family: 'DM Sans', sans-serif; }
        .prop-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          50% { transform: scale(1.12) translate(2%, -2%); opacity: 0.8; }
        }
        @keyframes orb-drift {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.3; }
          50% { transform: scale(0.9) translate(-3%, 4%); opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, rgba(${m.accentRgb},0.6) 0%, rgba(${m.accentRgb},1) 40%, rgba(${m.accentRgb},0.6) 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .glass-card {
          background: ${m.surface};
          border: 1px solid ${m.border};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .section-num {
          font-size: clamp(5rem, 12vw, 9rem);
          line-height: 1;
          font-weight: 300;
          font-family: 'Cormorant Garamond', serif;
          color: rgba(${m.accentRgb}, 0.06);
          position: absolute;
          top: -1rem;
          right: 0;
          pointer-events: none;
          user-select: none;
        }
      `}</style>

      {/* ── NAVBAR — RFM Website Style ── */}
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: `rgba(${m.bg === "#faf8f4" ? "250,248,244" : m.bg === "#080604" ? "8,6,4" : m.bg === "#090507" ? "9,5,7" : "5,11,7"},0.93)`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${m.border}`,
        }}
      >
        {/* Top micro-bar */}
        <div className="hidden lg:flex items-center justify-between border-b px-6 py-1.5" style={{ borderColor: m.border }}>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/rfm_wedding_photography/" target="_blank" rel="noreferrer"
              className="prop-body flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition hover:opacity-70"
              style={{ color: m.muted }}>
              <Instagram size={11} />rfm_wedding_photography
            </a>
            <span style={{ color: m.border }}>·</span>
            <a href="https://rfmweddingphotography.in/" target="_blank" rel="noreferrer"
              className="prop-body flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition hover:opacity-70"
              style={{ color: m.muted }}>
              <Globe size={11} />rfmweddingphotography.in
            </a>
          </div>
          <a href="https://wa.me/919928588659" target="_blank" rel="noreferrer"
            className="prop-body flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition hover:opacity-70"
            style={{ color: m.accent }}>
            <Phone size={11} />+91 99285 88659
          </a>
        </div>

        {/* Main row: left-nav | RFM. center | right-nav + CTA */}
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-5 py-3">

          {/* Left nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navSections.slice(1, 4).map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className="prop-body rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-wider transition"
                style={{ color: activeSection === s.id ? m.accent : m.muted, fontWeight: activeSection === s.id ? 600 : 400 }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger (takes left slot on mobile) */}
          <div className="flex lg:hidden items-center gap-2">
            <button onClick={() => setNavOpen(o => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: m.surface, color: m.accent }}>
              {navOpen ? <X size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Center: RFM. logo */}
          <div className="flex flex-col items-center justify-center">
            <p className="prop-serif font-medium" style={{ color: m.accent, fontSize: "1.4rem", letterSpacing: "0.1em" }}>RFM.</p>
            <p className="prop-body uppercase" style={{ color: m.muted, fontSize: "0.52rem", letterSpacing: "0.28em", marginTop: "-1px" }}>Photography</p>
          </div>

          {/* Right: nav + WhatsApp */}
          <div className="flex items-center justify-end gap-1">
            <div className="hidden lg:flex items-center gap-1">
              {navSections.slice(4, 7).map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className="prop-body rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-wider transition"
                  style={{ color: activeSection === s.id ? m.accent : m.muted, fontWeight: activeSection === s.id ? 600 : 400 }}>
                  {s.label}
                </button>
              ))}
            </div>
            <a href="https://wa.me/919928588659" target="_blank" rel="noreferrer"
              className="prop-body ml-2 flex items-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition hover:opacity-80"
              style={{ background: m.accent, color: m.bg }}>
              <Phone size={11} /><span className="hidden sm:inline">WhatsApp</span><span className="sm:hidden">WA</span>
            </a>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
              style={{ borderTop: `1px solid ${m.border}` }}
            >
              <div className="px-5 py-3 space-y-1">
                {navSections.map(s => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className="prop-body flex w-full rounded-xl px-4 py-2.5 text-sm text-left"
                    style={{ color: activeSection === s.id ? m.accent : m.muted, background: activeSection === s.id ? m.surface : "transparent" }}>
                    {s.label}
                  </button>
                ))}
                <div className="pt-3 flex flex-wrap gap-4 pb-1">
                  <a href="https://www.instagram.com/rfm_wedding_photography/" target="_blank" rel="noreferrer"
                    className="prop-body flex items-center gap-1.5 text-xs" style={{ color: m.accent }}>
                    <Instagram size={13} />Instagram
                  </a>
                  <a href="https://rfmweddingphotography.in/" target="_blank" rel="noreferrer"
                    className="prop-body flex items-center gap-1.5 text-xs" style={{ color: m.accent }}>
                    <Globe size={13} />Website
                  </a>
                  <a href="https://wa.me/919928588659" target="_blank" rel="noreferrer"
                    className="prop-body flex items-center gap-1.5 text-xs" style={{ color: m.accent }}>
                    <Phone size={13} />+91 99285 88659
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════════════ HERO — fixed layout, no overlap ══════════════ */}
      <section id="hero" className="relative flex min-h-screen flex-col overflow-hidden" style={{ paddingTop: "6.5rem" }}>

        {/* Animated orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{
            position: "absolute", top: "8%", left: "12%", width: "500px", height: "500px",
            borderRadius: "50%", background: `radial-gradient(circle, rgba(${m.accentRgb},0.18) 0%, transparent 70%)`,
            animation: "orb-pulse 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "12%", right: "8%", width: "380px", height: "380px",
            borderRadius: "50%", background: `radial-gradient(circle, rgba(${m.accentRgb},0.12) 0%, transparent 70%)`,
            animation: "orb-drift 10s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "700px", height: "700px", borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${m.accentRgb},0.05) 0%, transparent 65%)`,
          }} />
        </div>

        {/* Main content — flex-1, centered */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, letterSpacing: "0.25em" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="prop-body mb-5 text-[10px] uppercase"
            style={{ color: m.accent }}
          >
            ✦ Wedding Proposal ✦
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="prop-serif leading-[0.88] tracking-tight"
            style={{ fontSize: "clamp(3rem, 10vw, 8rem)", color: m.text, fontWeight: 300 }}
          >
            {proposal.bride_name}
            <br />
            <span className="gold-shimmer italic" style={{ fontSize: "clamp(1.4rem, 4vw, 2.8rem)", display: "block", margin: "0.15em 0", letterSpacing: "0.12em" }}>
              &amp; together
            </span>
            {proposal.groom_name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mx-auto my-5 flex items-center gap-6 max-w-[200px]"
          >
            <div className="h-px flex-1" style={{ background: `rgba(${m.accentRgb},0.3)` }} />
            <Star size={10} style={{ color: m.accent }} />
            <div className="h-px flex-1" style={{ background: `rgba(${m.accentRgb},0.3)` }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="prop-body mx-auto max-w-md text-sm leading-relaxed"
            style={{ color: m.muted }}
          >
            {proposal.tagline}
          </motion.p>

          {proposal.wedding_dates?.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="prop-body mt-4 text-[11px] uppercase tracking-[0.22em]"
              style={{ color: m.accent }}
            >
              {proposal.wedding_dates.join(" · ")}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mt-7 flex flex-wrap justify-center gap-3"
          >
            <button
              onClick={() => scrollTo("investment")}
              className="prop-body rounded-xl px-6 py-2.5 text-sm font-medium uppercase tracking-widest transition hover:opacity-80"
              style={{ background: m.accent, color: m.bg }}
            >
              View Investment
            </button>
            <button
              onClick={() => scrollTo("coverage")}
              className="prop-body rounded-xl border px-6 py-2.5 text-sm font-medium uppercase tracking-widest transition hover:opacity-70"
              style={{ borderColor: m.border, color: m.muted }}
            >
              Explore Coverage
            </button>
          </motion.div>
        </div>

        {/* Stats bar — at the very bottom, normal flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="relative z-10 flex justify-center gap-10 md:gap-16 px-5 py-6"
          style={{ borderTop: `1px solid rgba(${m.accentRgb},0.15)` }}
        >
          {[
            { val: totalDays, label: "Days", suffix: "" },
            { val: totalCrew, label: "Crew", suffix: "+" },
            { val: Math.round(proposal.investment?.total / 1000), label: "Investment", prefix: "₹", suffix: "K" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="prop-serif font-light" style={{ color: m.accent, fontSize: "clamp(1.5rem,3.5vw,2.2rem)" }}>
                <CountUp to={s.val} prefix={s.prefix ?? ""} suffix={s.suffix} />
              </p>
              <p className="prop-body mt-0.5 text-[10px] uppercase tracking-[0.2em]" style={{ color: m.muted }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="relative z-10 flex justify-center pb-3"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ color: `rgba(${m.accentRgb},0.35)` }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ══════════════ COVERAGE ══════════════ */}
      <section id="coverage" className="relative px-5 py-28" style={{ borderTop: `1px solid ${m.border}` }}>
        <div className="mx-auto max-w-5xl">
          <RevealUp>
            <div className="relative mb-14">
              <span className="section-num">01</span>
              <p className="prop-body text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: m.accent }}>Your Team</p>
              <h2 className="prop-serif font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: m.text }}>Coverage</h2>
              <p className="prop-body mt-3 text-sm leading-relaxed max-w-lg" style={{ color: m.muted }}>
                A complete team dedicated to preserving every chapter of your wedding story.
              </p>
            </div>
          </RevealUp>

          <div className="grid gap-5 md:grid-cols-2">
            {proposal.coverage.map((day, i) => (
              <RevealUp key={i} delay={i * 0.12}>
                <div className="glass-card rounded-3xl p-7 h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="prop-serif text-2xl font-light" style={{ color: m.text }}>{day.day}</p>
                      <p className="prop-body mt-1 text-xs uppercase tracking-wider" style={{ color: m.accent }}>{day.subtitle}</p>
                    </div>
                    <div
                      className="prop-serif text-3xl font-light"
                      style={{ color: `rgba(${m.accentRgb},0.2)`, lineHeight: 1 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div style={{ height: "1px", background: m.border, marginBottom: "1.5rem" }} />
                  <ul className="space-y-3">
                    {day.crew.map((member, j) => (
                      <li key={j} className="prop-body flex items-center gap-3 text-sm" style={{ color: m.muted }}>
                        <div className="h-px w-4 shrink-0" style={{ background: m.accent, opacity: 0.6 }} />
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ INVESTMENT ══════════════ */}
      <section id="investment" className="relative px-5 py-28" style={{ borderTop: `1px solid ${m.border}` }}>
        <div className="mx-auto max-w-4xl">
          <RevealUp>
            <div className="relative mb-14">
              <span className="section-num">02</span>
              <p className="prop-body text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: m.accent }}>Transparent Pricing</p>
              <h2 className="prop-serif font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: m.text }}>Investment</h2>
              <p className="prop-body mt-3 text-sm" style={{ color: m.muted }}>{proposal.investment?.description}</p>
            </div>
          </RevealUp>

          <RevealUp delay={0.15}>
            <div
              className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center mb-6"
              style={{ background: m.gradientCard, border: `1px solid rgba(${m.accentRgb},0.25)` }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(${m.accentRgb},0.12) 0%, transparent 60%)` }}
              />
              <p className="prop-body relative text-xs uppercase tracking-[0.25em] mb-4" style={{ color: m.muted }}>Total Investment</p>
              <p className="prop-serif relative font-light leading-none" style={{ fontSize: "clamp(3rem,9vw,6rem)", color: m.text }}>
                ₹<CountUp to={proposal.investment?.total ?? 0} />
                <span style={{ fontSize: "clamp(1.2rem,3vw,2rem)", color: m.accent }}> /-</span>
              </p>
              <p className="prop-body relative mt-4 text-sm" style={{ color: m.muted }}>{proposal.investment?.description}</p>
            </div>
          </RevealUp>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { pct: proposal.investment?.advance ?? 30, label: "Advance", desc: "At the time of booking to confirm your dates" },
              { pct: proposal.investment?.weddingDay ?? 60, label: "Wedding Day", desc: "Payment on the wedding day" },
              { pct: proposal.investment?.balance ?? 10, label: "Balance", desc: "Before final delivery of all files" },
            ].map((p, i) => (
              <RevealUp key={i} delay={0.1 * i}>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <p className="prop-serif font-light" style={{ fontSize: "clamp(2rem,5vw,3rem)", color: m.accent }}>
                    <CountUp to={p.pct} suffix="%" />
                  </p>
                  <p className="prop-body mt-1 text-sm font-medium" style={{ color: m.text }}>{p.label}</p>
                  <p className="prop-body mt-2 text-xs leading-relaxed" style={{ color: m.muted }}>{p.desc}</p>
                </div>
              </RevealUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ DELIVERABLES ══════════════ */}
      <section id="deliverables" className="relative px-5 py-28" style={{ borderTop: `1px solid ${m.border}` }}>
        <div className="mx-auto max-w-5xl">
          <RevealUp>
            <div className="relative mb-14">
              <span className="section-num">03</span>
              <p className="prop-body text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: m.accent }}>What You Receive</p>
              <h2 className="prop-serif font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: m.text }}>Deliverables</h2>
              <p className="prop-body mt-3 text-sm" style={{ color: m.muted }}>From cinematic films to premium albums, every memory delivered with care.</p>
            </div>
          </RevealUp>
          <div className="grid gap-4 sm:grid-cols-2">
            {proposal.deliverables.map((cat, i) => (
              <RevealUp key={i} delay={i * 0.08}>
                <div className="glass-card rounded-3xl p-6 h-full">
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `rgba(${m.accentRgb},0.12)`, color: m.accent }}
                    >
                      <DynamicIcon name={cat.icon} size={19} />
                    </div>
                    <p className="prop-serif text-xl font-light" style={{ color: m.text }}>{cat.category}</p>
                  </div>
                  <ul className="space-y-3">
                    {cat.items.map((item, j) => (
                      <li key={j} className="prop-body flex items-start gap-3 text-sm" style={{ color: m.muted }}>
                        <Check size={13} className="mt-0.5 shrink-0" style={{ color: m.accent }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SMART FEATURES ══════════════ */}
      {proposal.smart_features?.length > 0 && (
        <section id="features" className="relative px-5 py-28" style={{ borderTop: `1px solid ${m.border}` }}>
          <div className="mx-auto max-w-5xl">
            <RevealUp>
              <div className="relative mb-14">
                <span className="section-num">04</span>
                <p className="prop-body text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: m.accent }}>Technology</p>
                <h2 className="prop-serif font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: m.text }}>Smart Features</h2>
              </div>
            </RevealUp>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {proposal.smart_features.map((f, i) => (
                <RevealUp key={i} delay={i * 0.07}>
                  <div className="glass-card rounded-2xl p-5 h-full">
                    <div
                      className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: `rgba(${m.accentRgb},0.12)`, color: m.accent }}
                    >
                      <Zap size={15} />
                    </div>
                    <p className="prop-serif text-base font-light" style={{ color: m.text }}>{f.title}</p>
                    <p className="prop-body mt-2 text-xs leading-relaxed" style={{ color: m.muted }}>{f.desc}</p>
                  </div>
                </RevealUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ CUSTOM FIELDS ══════════════ */}
      {proposal.custom_fields?.length > 0 && (
        <section id="custom" className="relative px-5 py-28" style={{ borderTop: `1px solid ${m.border}` }}>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-5 md:grid-cols-2">
              {proposal.custom_fields.map((cf, i) => (
                <RevealUp key={i} delay={i * 0.1}>
                  <div className="glass-card rounded-3xl p-7 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `rgba(${m.accentRgb},0.12)`, color: m.accent }}>
                        <DynamicIcon name={cf.icon} size={18} />
                      </div>
                      <p className="prop-serif text-xl font-light" style={{ color: m.text }}>{cf.label}</p>
                    </div>
                    <p className="prop-body text-sm leading-relaxed whitespace-pre-line" style={{ color: m.muted }}>{cf.content}</p>
                  </div>
                </RevealUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ TERMS ══════════════ */}
      <section id="terms" className="relative px-5 py-28" style={{ borderTop: `1px solid ${m.border}` }}>
        <div className="mx-auto max-w-3xl">
          <RevealUp>
            <div className="relative mb-14">
              <span className="section-num">05</span>
              <p className="prop-body text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: m.accent }}>Legal</p>
              <h2 className="prop-serif font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: m.text }}>Terms &amp; Conditions</h2>
            </div>
          </RevealUp>
          <RevealUp delay={0.1}>
            <ul className="space-y-5">
              {proposal.terms.map((term, i) => (
                <li key={i} className="flex items-start gap-5">
                  <span
                    className="prop-serif shrink-0 text-2xl font-light"
                    style={{ color: `rgba(${m.accentRgb},0.35)`, lineHeight: 1.4 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="mb-3 h-px w-8" style={{ background: `rgba(${m.accentRgb},0.3)` }} />
                    <p className="prop-body text-sm leading-relaxed" style={{ color: m.muted }}>{term}</p>
                  </div>
                </li>
              ))}
            </ul>
          </RevealUp>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section id="faq" className="relative px-5 py-28" style={{ borderTop: `1px solid ${m.border}` }}>
        <div className="mx-auto max-w-3xl">
          <RevealUp>
            <div className="relative mb-12">
              <span className="section-num">06</span>
              <p className="prop-body text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: m.accent }}>Got Questions?</p>
              <h2 className="prop-serif font-light" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: m.text }}>
                Frequently Asked
              </h2>
            </div>
          </RevealUp>
          <RevealUp delay={0.15}>
            <PremiumFaq items={proposal.faq} m={m} />
          </RevealUp>
        </div>
      </section>

      {/* ══════════════ CONTACT / CTA ══════════════ */}
      <section id="contact" className="relative overflow-hidden px-5 py-32 text-center" style={{ borderTop: `1px solid ${m.border}` }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: `radial-gradient(ellipse at 50% 50%, rgba(${m.accentRgb},0.1) 0%, transparent 65%)` }}
        />
        <div className="relative mx-auto max-w-2xl">
          <RevealUp>
            <div
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: m.surface, border: `1px solid ${m.border}` }}
            >
              <Heart size={26} style={{ color: m.accent }} />
            </div>
            <p className="prop-body text-[10px] uppercase tracking-[0.25em] mb-4" style={{ color: m.accent }}>Begin Your Story</p>
            <h2 className="prop-serif font-light leading-tight" style={{ fontSize: "clamp(2.5rem,7vw,5rem)", color: m.text }}>
              Let&apos;s Capture<br />
              <span className="italic" style={{ color: m.accent }}>Your Day</span>
            </h2>
            <p className="prop-body mt-5 mx-auto max-w-md text-sm leading-relaxed" style={{ color: m.muted }}>
              We would be delighted to document your wedding story. Reach out to confirm your dates and begin this journey with us.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {proposal.contact.phone && (
                <a
                  href={`tel:${proposal.contact.phone}`}
                  className="prop-body flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-medium uppercase tracking-wider transition hover:opacity-80"
                  style={{ background: m.accent, color: m.bg }}
                >
                  <Phone size={15} />Contact RFM
                </a>
              )}
              {proposal.contact.email && (
                <a
                  href={`mailto:${proposal.contact.email}`}
                  className="prop-body flex items-center gap-2.5 rounded-2xl border px-7 py-3.5 text-sm font-medium uppercase tracking-wider transition hover:opacity-70"
                  style={{ borderColor: m.border, color: m.muted }}
                >
                  <Mail size={15} />Send Email
                </a>
              )}
            </div>

            {proposal.contact.instagram && (
              <a
                href={`https://instagram.com/${proposal.contact.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="prop-body mt-5 inline-flex items-center gap-2 text-xs transition hover:opacity-80"
                style={{ color: m.accent }}
              >
                <Instagram size={14} />{proposal.contact.instagram}
              </a>
            )}

            <p className="prop-body mt-10 text-xs" style={{ color: `rgba(${m.accentRgb},0.3)` }}>
              Proposal valid for 7 days from the date of issue
            </p>
          </RevealUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 py-10 text-center" style={{ borderTop: `1px solid ${m.border}` }}>
        <GoldLine />
        <p className="prop-serif mt-6 text-xl font-light" style={{ color: m.accent }}>RFM Wedding Photography</p>
        <p className="prop-body mt-1 text-xs" style={{ color: m.muted }}>Capturing love stories with artistry and heart.</p>
        <div className="mt-5 flex justify-center gap-6">
          {proposal.contact.instagram && (
            <a href={`https://instagram.com/${proposal.contact.instagram.replace("@","")}`} target="_blank" rel="noreferrer"
              className="prop-body text-xs transition hover:opacity-80" style={{ color: m.muted }}>Instagram</a>
          )}
          {proposal.contact.email && (
            <a href={`mailto:${proposal.contact.email}`} className="prop-body text-xs hover:opacity-80 transition" style={{ color: m.muted }}>Email</a>
          )}
          {proposal.contact.phone && (
            <a href={`tel:${proposal.contact.phone}`} className="prop-body text-xs hover:opacity-80 transition" style={{ color: m.muted }}>Phone</a>
          )}
        </div>
        <GoldLine />
      </footer>
    </div>
  );
}

