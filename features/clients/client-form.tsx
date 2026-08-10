"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Camera, Check, Copy, Link2, Plane, Shirt, Sparkles, UserPlus, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClientRecord } from "@/services/clients";

const schema = z.object({
  clientName: z.string().min(2, "Enter a client name"),
  brideName: z.string().min(2, "Required"),
  groomName: z.string().min(2, "Required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(8, "Required"),
  familyContact: z.string().optional(),
  weddingDate: z.string().min(1, "Required"),
  haldiDate: z.string().optional(),
  mehnadiDate: z.string().optional(),
  sangeetDate: z.string().optional(),
  baraatTiming: z.string().optional(),
  packageName: z.string().min(1, "Required"),
  packageDays: z.string().min(1, "Required"),
  price: z.coerce.number().positive("Enter a price"),
  location: z.string().min(3, "Required"),
  dressCode: z.string().optional(),
  droneRequired: z.boolean(),
  cinematicRequired: z.boolean(),
  notes: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function ClientForm() {
  const [created, setCreated] = useState(false);
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<Values, unknown, Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: { packageName: "The Grandeur", packageDays: "2", price: 385000, droneRequired: true, cinematicRequired: true },
  });

  const drone = watch("droneRequired");
  const cinematic = watch("cinematicRequired");

  const submit = async (values: Values) => {
    try {
      if (isSupabaseConfigured()) {
        await createClientRecord({ ...values, status: "planning" });
      }
      setCreated(true);
      toast.success("Client created successfully!");
    } catch (error) {
      toast.error("Could not create client", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  if (created) {
    // Generate a deterministic-looking portal code
    const portalCode = "NEW2026";
    const registrationLink = `${typeof window !== "undefined" ? window.location.origin : ""}/register/${portalCode}`;

    return (
      <div className="mx-auto max-w-2xl p-5 md:p-8">
        <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-soft dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-transparent">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,.35)]">
            <Check size={30} className="text-white" />
          </div>
          <h2 className="mt-5 font-display text-2xl">Their portal is live 🎉</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            Share this private link with your client. They can review their wedding plan, timeline, and invite guests.
          </p>

          {/* Portal link */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border bg-[hsl(var(--muted))] p-3.5 text-left">
            <span className="truncate text-sm font-medium">rfmweddings.com/client/{portalCode}</span>
            <button onClick={() => toast.success("Portal link copied!")} className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-champagne text-white transition hover:bg-champagne/80">
              <Copy size={15} />
            </button>
          </div>

          {/* Self-registration link section */}
          <div className="mt-4 rounded-2xl border border-champagne/30 bg-champagne/5 p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus size={15} className="text-champagne" />
              <p className="text-sm font-semibold text-champagne">Customer self-registration link</p>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">
              Share this with the couple so they can fill their own details, dress code, and preferences directly.
            </p>
            <div className="flex items-center gap-2 rounded-xl border bg-white p-2.5 text-xs dark:bg-transparent">
              <span className="flex-1 truncate font-mono text-[hsl(var(--muted-foreground))]">{registrationLink}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(registrationLink); toast.success("Registration link copied!"); }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-champagne text-white transition hover:bg-champagne/80"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-3">
            <Link href="/clients"><Button variant="outline">View all clients</Button></Link>
            <Link href="/client/S1YA26"><Button><Link2 size={16} />Preview portal</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-5 md:p-8">
      <Link href="/clients" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">
        <ArrowLeft size={16} /> Back to clients
      </Link>

      {/* Header */}
      <div className="mb-7">
        <p className="eyebrow">New relationship</p>
        <h1 className="mt-1 font-display text-3xl">Create a client</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Fill in the details — their private planning portal is generated automatically.</p>
      </div>

      {/* Step indicators */}
      <div className="mb-7 flex items-center gap-3">
        {["Couple Details", "Event Dates", "Package & Preferences"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <button onClick={() => setStep(i + 1)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${step === i + 1 ? "bg-ink text-white dark:bg-champagne" : step > i + 1 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
              {step > i + 1 ? <Check size={13} /> : <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-bold">{i + 1}</span>}
              <span className="hidden sm:block">{label}</span>
            </button>
            {i < 2 && <div className={`h-px w-6 ${step > i + 1 ? "bg-emerald-400" : "bg-[hsl(var(--border))]"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(submit)}>
        {/* Step 1: Couple Details */}
        {step === 1 && (
          <div className="surface p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10 text-champagne"><Camera size={18} /></div>
              <div><p className="font-semibold">Couple & Contact</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Basic information about the couple</p></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Client / couple name" error={errors.clientName?.message}>
                <Input placeholder="e.g. Siya & Aarav" {...register("clientName")} />
              </Field>
              <Field label="Bride name" error={errors.brideName?.message}>
                <Input placeholder="Siya Mehta" {...register("brideName")} />
              </Field>
              <Field label="Groom name" error={errors.groomName?.message}>
                <Input placeholder="Aarav Kapoor" {...register("groomName")} />
              </Field>
              <Field label="Email address" error={errors.email?.message}>
                <Input type="email" placeholder="siya@email.com" {...register("email")} />
              </Field>
              <Field label="Phone number" error={errors.phone?.message}>
                <Input placeholder="+91 98765 43210" {...register("phone")} />
              </Field>
              <Field label="Family contact (optional)">
                <Input placeholder="+91 98765 00000" {...register("familyContact")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Event location / venue" error={errors.location?.message}>
                  <Input placeholder="The Leela Palace, Udaipur" {...register("location")} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Dress code (optional)">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-champagne/5 text-champagne">
                      <Shirt size={16} />
                    </div>
                    <Input placeholder="e.g. Ivory & Gold, Ethnic wear encouraged" {...register("dressCode")} />
                  </div>
                </Field>
              </div>
            </div>
            <div className="mt-7 flex justify-end border-t pt-5">
              <Button type="button" onClick={() => setStep(2)}>Continue <ArrowRight size={16} /></Button>
            </div>
          </div>
        )}

        {/* Step 2: Event Dates */}
        {step === 2 && (
          <div className="surface p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10 text-champagne"><Sparkles size={18} /></div>
              <div><p className="font-semibold">Event Schedule</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Dates and timings for all functions</p></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Main wedding date" error={errors.weddingDate?.message}>
                <Input type="date" {...register("weddingDate")} />
              </Field>
              <Field label="Haldi date (optional)">
                <Input type="date" {...register("haldiDate")} />
              </Field>
              <Field label="Mehndi date (optional)">
                <Input type="date" {...register("mehnadiDate")} />
              </Field>
              <Field label="Sangeet date (optional)">
                <Input type="date" {...register("sangeetDate")} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Baraat timing (optional)">
                  <Input placeholder="e.g. 6:00 PM — Grand Procession from Radisson Hotel" {...register("baraatTiming")} />
                </Field>
              </div>
            </div>
            <div className="mt-7 flex items-center justify-between border-t pt-5">
              <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</Button>
              <Button type="button" onClick={() => setStep(3)}>Continue <ArrowRight size={16} /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Package & Preferences */}
        {step === 3 && (
          <div className="surface p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10 text-champagne"><Video size={18} /></div>
              <div><p className="font-semibold">Package & Preferences</p><p className="text-xs text-[hsl(var(--muted-foreground))]">Coverage details and special requirements</p></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Package" error={errors.packageName?.message}>
                <select className="flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 text-sm outline-none focus:border-champagne" {...register("packageName")}>
                  <option>The Grandeur</option>
                  <option>Heirloom</option>
                  <option>Essential</option>
                  <option>Custom</option>
                </select>
              </Field>
              <Field label="Coverage days" error={errors.packageDays?.message}>
                <select className="flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3 text-sm outline-none focus:border-champagne" {...register("packageDays")}>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="4">4 Days</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Package price (₹)" error={errors.price?.message}>
                  <Input type="number" {...register("price")} />
                </Field>
              </div>
            </div>

            {/* Toggles */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ToggleCard
                icon={<Plane size={18} />}
                label="Drone Coverage"
                description="Aerial shots of the venue & ceremonies"
                active={drone}
                onToggle={() => setValue("droneRequired", !drone)}
              />
              <ToggleCard
                icon={<Video size={18} />}
                label="Cinematic Film"
                description="Full cinematic wedding film production"
                active={cinematic}
                onToggle={() => setValue("cinematicRequired", !cinematic)}
              />
            </div>

            <div className="mt-5">
              <Field label="Private notes (optional)">
                <textarea
                  className="min-h-24 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent p-3 text-sm outline-none focus:border-champagne"
                  placeholder="Any special instructions for the team, key people to capture, family dynamics, etc."
                  {...register("notes")}
                />
              </Field>
            </div>

            <div className="mt-7 flex items-center justify-between border-t pt-5">
              <Button type="button" variant="outline" onClick={() => setStep(2)}><ArrowLeft size={16} /> Back</Button>
              <Button disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create client portal"}</Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function ToggleCard({ icon, label, description, active, onToggle }: {
  icon: React.ReactNode; label: string; description: string; active: boolean; onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${active ? "border-champagne bg-champagne/8" : "border-[hsl(var(--border))] hover:border-champagne/40"}`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? "bg-champagne text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      <div className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${active ? "bg-champagne" : "bg-[hsl(var(--muted))]"}`}>
        <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}
