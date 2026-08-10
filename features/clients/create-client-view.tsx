"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft, ArrowRight, Calendar, Camera, Check, Clock, Copy, Eye, Filter,
  Heart, Link2, Loader2, Mail, MapPin, Phone, Plane, Search, Shirt, Sparkles,
  Trash2, UserPlus, Video, X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOwnerClient, deleteOwnerClient, getOwnerClients, type FullOwnerClient } from "@/services/owner-clients";

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

export function CreateClientView() {
  const [createdClient, setCreatedClient] = useState<FullOwnerClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<FullOwnerClient | null>(null);
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");
  const [ownerClients, setOwnerClients] = useState<FullOwnerClient[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { register, handleSubmit, watch, setValue, reset, trigger, formState: { errors, isSubmitting } } = useForm<Values, unknown, Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: { packageName: "The Grandeur", packageDays: "2", price: 385000, droneRequired: true, cinematicRequired: true },
  });

  const drone = watch("droneRequired");
  const cinematic = watch("cinematicRequired");

  const loadList = async () => {
    setLoadingList(true);
    try {
      const data = await getOwnerClients();
      setOwnerClients(data);
    } catch {
      toast.error("Failed to load owner clients");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const submit = async (values: Values) => {
    try {
      const newClient = await createOwnerClient({ ...values, status: "planning" });
      if (newClient) {
        setCreatedClient(newClient);
        setOwnerClients(prev => [newClient, ...prev]);
        toast.success("Client saved successfully!");
      } else {
        toast.error("Could not save client. Please check details.");
      }
    } catch (error) {
      toast.error("Could not create client", { description: error instanceof Error ? error.message : "Please try again." });
    }
  };

  const onFormError = (errs: any) => {
    const errorKeys = Object.keys(errs);
    if (errorKeys.some(k => ["clientName", "brideName", "groomName", "email", "phone", "location"].includes(k))) {
      setStep(1);
      toast.error("Please complete required Couple & Contact details in Step 1.");
    } else if (errorKeys.some(k => ["weddingDate"].includes(k))) {
      setStep(2);
      toast.error("Please select a Wedding Date in Step 2.");
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const nextStepFrom1 = async () => {
    const valid = await trigger(["clientName", "brideName", "groomName", "email", "phone", "location"]);
    if (valid) {
      setStep(2);
    } else {
      toast.error("Please fill in all required fields on Step 1");
    }
  };

  const nextStepFrom2 = async () => {
    const valid = await trigger(["weddingDate"]);
    if (valid) {
      setStep(3);
    } else {
      toast.error("Please select a Main Wedding Date on Step 2");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove them from Supabase database.`)) return;
    setDeletingId(id);
    try {
      const success = await deleteOwnerClient(id);
      if (success) {
        setOwnerClients(prev => prev.filter(c => c.id !== id));
        if (selectedClient?.id === id) setSelectedClient(null);
        toast.success("Client deleted from database!");
      } else {
        toast.error("Failed to delete client");
      }
    } catch {
      toast.error("Error deleting client");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredList = useMemo(() => {
    return ownerClients.filter(c =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.brideName.toLowerCase().includes(search.toLowerCase()) ||
      c.groomName.toLowerCase().includes(search.toLowerCase())
    );
  }, [ownerClients, search]);

  return (
    <div className="mx-auto max-w-5xl p-5 md:p-8">
      {/* Page Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Owner Management</p>
          <h1 className="mt-1 font-display text-3xl">Create Client</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Add client details directly into your Supabase database and manage owner-added clients.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[hsl(var(--muted))] p-1">
          <button
            onClick={() => setActiveTab("form")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "form" ? "bg-ink text-white shadow dark:bg-champagne dark:text-ink" : "text-[hsl(var(--muted-foreground))]"}`}
          >
            Add New Client
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "list" ? "bg-ink text-white shadow dark:bg-champagne dark:text-ink" : "text-[hsl(var(--muted-foreground))]"}`}
          >
            Owner Clients List
            <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-[10px] text-champagne">{ownerClients.length}</span>
          </button>
        </div>
      </div>

      {activeTab === "form" && (
        <>
          {createdClient ? (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-8 text-center shadow-soft dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-transparent">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,.35)]">
                  <Check size={30} className="text-white" />
                </div>
                <h2 className="mt-5 font-display text-2xl">Client Created & Saved 🎉</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
                  {createdClient.clientName} has been saved to your database.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setCreatedClient(null);
                      setStep(1);
                      reset();
                    }}
                    variant="outline"
                  >
                    Add another client
                  </Button>
                  <Button onClick={() => setActiveTab("list")}>
                    View owner clients list
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              {/* Step indicators */}
              <div className="mb-7 flex items-center gap-3">
                {["Couple Details", "Event Dates", "Package & Preferences"].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <button
                      onClick={() => setStep(i + 1)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        step === i + 1
                          ? "bg-ink text-white dark:bg-champagne dark:text-ink"
                          : step > i + 1
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                      }`}
                    >
                      {step > i + 1 ? (
                        <Check size={13} />
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                          {i + 1}
                        </span>
                      )}
                      <span className="hidden sm:block">{label}</span>
                    </button>
                    {i < 2 && <div className={`h-px w-6 ${step > i + 1 ? "bg-emerald-400" : "bg-[hsl(var(--border))]"}`} />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit(submit, onFormError)}>
                {/* Step 1: Couple Details */}
                {step === 1 && (
                  <div className="surface p-6 md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10 text-champagne">
                        <Camera size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">Couple & Contact</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Basic information about the couple</p>
                      </div>
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
                      <Button type="button" onClick={nextStepFrom1}>
                        Continue <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Event Dates */}
                {step === 2 && (
                  <div className="surface p-6 md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10 text-champagne">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">Event Schedule</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Dates and timings for functions</p>
                      </div>
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
                          <Input placeholder="e.g. 6:00 PM — Procession from Hotel" {...register("baraatTiming")} />
                        </Field>
                      </div>
                    </div>
                    <div className="mt-7 flex items-center justify-between border-t pt-5">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft size={16} /> Back
                      </Button>
                      <Button type="button" onClick={nextStepFrom2}>
                        Continue <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Package & Preferences */}
                {step === 3 && (
                  <div className="surface p-6 md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10 text-champagne">
                        <Video size={18} />
                      </div>
                      <div>
                        <p className="font-semibold">Package & Preferences</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Coverage details and special requirements</p>
                      </div>
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
                          placeholder="Special instructions or details for this client..."
                          {...register("notes")}
                        />
                      </Field>
                    </div>

                    <div className="mt-7 flex items-center justify-between border-t pt-5">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft size={16} /> Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving to Database..." : "Save Client to Supabase"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </>
      )}

      {activeTab === "list" && (
        <div className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
                placeholder="Search owner-added clients..."
              />
            </div>
          </div>

          {loadingList ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-[hsl(var(--muted-foreground))]">
              <Loader2 size={18} className="animate-spin text-champagne" /> Loading owner clients from Supabase...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No owner clients found. Click "Add New Client" above to create one.
            </div>
          ) : (
            <div className="divide-y">
              {filteredList.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className="flex items-center justify-between p-4 transition hover:bg-[hsl(var(--muted))] cursor-pointer sm:px-6 group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-champagne/15 text-xs font-bold text-champagne group-hover:scale-105 transition">
                      {c.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate group-hover:text-champagne transition">{c.clientName}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {c.location} {c.weddingDate ? `· ${c.weddingDate}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge tone={c.status === "confirmed" ? "success" : "gold"}>
                      {c.status}
                    </Badge>
                    <span className="hidden sm:inline text-xs font-semibold">
                      ₹{c.price.toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(c);
                      }}
                      className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-champagne/10 hover:text-champagne transition"
                      title="View all client details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id, c.clientName);
                      }}
                      disabled={deletingId === c.id}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition"
                      title="Delete client from database"
                    >
                      {deletingId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CLIENT DETAIL MODAL ── */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl surface border p-6 md:p-8 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80 hover:text-[hsl(var(--foreground))] transition"
            >
              <X size={18} />
            </button>

            {/* Header section */}
            <div className="flex items-center gap-4 border-b pb-5 pr-10">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-champagne/15 text-lg font-bold text-champagne">
                {selectedClient.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl font-semibold truncate">{selectedClient.clientName}</h2>
                  <Badge tone={selectedClient.status === "confirmed" ? "success" : "gold"}>
                    {selectedClient.status}
                  </Badge>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  Bride: <span className="font-medium text-[hsl(var(--foreground))]">{selectedClient.brideName}</span> · Groom: <span className="font-medium text-[hsl(var(--foreground))]">{selectedClient.groomName}</span>
                </p>
              </div>
            </div>

            {/* Content Details Grid */}
            <div className="space-y-6">
              {/* Section 1: Couple & Contact */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-champagne mb-3 flex items-center gap-2">
                  <Camera size={14} /> Couple & Contact Information
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 rounded-2xl bg-[hsl(var(--muted))/50] p-4 text-xs">
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Email Address</span>
                    <span className="font-medium mt-0.5 block truncate">{selectedClient.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Phone Number</span>
                    <span className="font-medium mt-0.5 block truncate">{selectedClient.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Family Contact</span>
                    <span className="font-medium mt-0.5 block truncate">{selectedClient.familyContact || "None specified"}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Event Location / Venue</span>
                    <span className="font-medium mt-0.5 block truncate flex items-center gap-1">
                      <MapPin size={12} className="text-champagne" /> {selectedClient.location || "N/A"}
                    </span>
                  </div>
                  {selectedClient.dressCode && (
                    <div className="sm:col-span-2 border-t border-[hsl(var(--border))] pt-2.5 mt-1">
                      <span className="text-[hsl(var(--muted-foreground))] block">Dress Code</span>
                      <span className="font-medium mt-0.5 block flex items-center gap-1.5">
                        <Shirt size={13} className="text-champagne" /> {selectedClient.dressCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Function & Event Schedule */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-champagne mb-3 flex items-center gap-2">
                  <Calendar size={14} /> Function & Event Schedule
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 rounded-2xl bg-[hsl(var(--muted))/50] p-4 text-xs">
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Main Wedding Date</span>
                    <span className="font-semibold text-champagne mt-0.5 block">{selectedClient.weddingDate || "Date TBD"}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Baraat Timing</span>
                    <span className="font-medium mt-0.5 block flex items-center gap-1">
                      <Clock size={12} className="text-champagne" /> {selectedClient.baraatTiming || "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Haldi Date</span>
                    <span className="font-medium mt-0.5 block">{selectedClient.haldiDate || "Not scheduled"}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Mehndi Date</span>
                    <span className="font-medium mt-0.5 block">{selectedClient.mehnadiDate || "Not scheduled"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[hsl(var(--muted-foreground))] block">Sangeet Date</span>
                    <span className="font-medium mt-0.5 block">{selectedClient.sangeetDate || "Not scheduled"}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Package & Preferences */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-champagne mb-3 flex items-center gap-2">
                  <Video size={14} /> Package & Service Details
                </h3>
                <div className="grid gap-3 sm:grid-cols-3 rounded-2xl bg-[hsl(var(--muted))/50] p-4 text-xs">
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Selected Package</span>
                    <span className="font-semibold text-sm mt-0.5 block">{selectedClient.packageName}</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Coverage Days</span>
                    <span className="font-medium text-sm mt-0.5 block">{selectedClient.packageDays || "1"} Days</span>
                  </div>
                  <div>
                    <span className="text-[hsl(var(--muted-foreground))] block">Package Price</span>
                    <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 block">₹{selectedClient.price.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="sm:col-span-3 flex flex-wrap gap-2 border-t border-[hsl(var(--border))] pt-3 mt-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${selectedClient.droneRequired ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
                      <Plane size={12} /> Drone Coverage: {selectedClient.droneRequired ? "Included" : "No"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${selectedClient.cinematicRequired ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}>
                      <Video size={12} /> Cinematic Film: {selectedClient.cinematicRequired ? "Included" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Notes */}
              {selectedClient.notes && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-champagne mb-2">
                    Private Notes
                  </h3>
                  <div className="rounded-2xl border bg-[hsl(var(--muted))/30] p-4 text-xs leading-relaxed whitespace-pre-wrap text-[hsl(var(--muted-foreground))]">
                    {selectedClient.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t pt-5">
              <Button
                variant="outline"
                onClick={() => handleDelete(selectedClient.id, selectedClient.clientName)}
                disabled={deletingId === selectedClient.id}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-950 dark:hover:bg-red-950/40"
              >
                {deletingId === selectedClient.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete Client
              </Button>
              <Button onClick={() => setSelectedClient(null)}>
                Done / Close
              </Button>
            </div>
          </div>
        </div>
      )}
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

function ToggleCard({
  icon,
  label,
  description,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        active ? "border-champagne bg-champagne/8" : "border-[hsl(var(--border))] hover:border-champagne/40"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-champagne text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
        }`}
      >
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
