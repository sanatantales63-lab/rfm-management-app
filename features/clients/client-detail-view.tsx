"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Check, Compass, ExternalLink, Globe, Heart, Loader2, Mail,
  MapPin, MessageSquareText, Phone, PhoneCall, Send, Shirt, Sparkles, Trash2, UserPlus, Users, Wallet
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/utils";
import { ClientDetailActions } from "./client-detail-actions";
import { deleteClientRecord, getClientById } from "@/services/clients";
import type { Client } from "@/types";

export function ClientDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getClientById(id);
        setClient(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!client) return;
    if (!confirm(`Are you sure you want to delete ${client.clientName}? This will permanently remove their records from Supabase.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteClientRecord(client.id);
      toast.success("Client deleted successfully");
      router.push("/clients");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete client", {
        description: err instanceof Error ? err.message : "Database request failed."
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-12 text-center text-sm text-[hsl(var(--muted-foreground))] flex items-center justify-center gap-2">
        <Loader2 size={18} className="animate-spin text-champagne" /> Loading client details...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="font-display text-2xl">Client not found</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          The requested client could not be located in Supabase.
        </p>
        <Link href="/clients" className="mt-6 inline-flex">
          <Button variant="outline"><ArrowLeft size={16} />Back to clients</Button>
        </Link>
      </div>
    );
  }

  const c = client;
  const brideFirst = c.brideName ? c.brideName.split(" ")[0] : "Bride";
  const groomFirst = c.groomName ? c.groomName.split(" ")[0] : "Groom";

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
        <ArrowLeft size={16} />Clients
      </Link>

      {/* Header section */}
      <section className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e9d6c1] text-sm font-bold text-[#795636]">{c.initials}</div>
          <div>
            <div className="flex gap-2 flex-wrap items-center">
              <h1 className="font-display text-3xl">{c.clientName}</h1>
              <Badge tone="success">{c.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] flex flex-wrap items-center gap-2">
              <span>{c.email}</span>
              {c.phone && <span>· Phone: {c.phone}</span>}
              {c.whatsapp && <span className="text-emerald-600 dark:text-emerald-400">· WhatsApp: {c.whatsapp}</span>}
            </p>
            {c.dressCode && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-champagne">
                <Shirt size={14} />Dress Code: {c.dressCode}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {deleting ? <Loader2 size={15} className="animate-spin text-red-500" /> : <Trash2 size={15} />}
            Delete client
          </Button>
          <Link href={`/client/${c.portalCode}`}>
            <Button variant="outline"><ExternalLink size={15} />View portal</Button>
          </Link>
          <Button><Send size={15} />Send update</Button>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          {/* Inquiry Details Card */}
          <section className="surface p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Sparkles className="text-champagne" size={18} />
              <h2 className="font-semibold text-lg">Registration Inquiry Details</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-xl bg-[hsl(var(--muted))/40] p-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 font-medium">
                  <Compass size={13} className="text-champagne" /> How Did You Find Us? (Referral)
                </span>
                <p className="mt-1 font-semibold text-base capitalize">{c.referralSource || "Not specified"}</p>
              </div>

              <div className="rounded-xl bg-[hsl(var(--muted))/40] p-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 font-medium">
                  <PhoneCall size={13} className="text-champagne" /> Preferred Contact Method
                </span>
                <p className="mt-1 font-semibold text-base capitalize">{c.preferredContact || "Not specified"}</p>
              </div>

              <div className="rounded-xl bg-[hsl(var(--muted))/40] p-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 font-medium">
                  <Users size={13} className="text-champagne" /> Guest Count
                </span>
                <p className="mt-1 font-semibold text-base">{c.guestCount ? `${c.guestCount} Guests` : "Not specified"}</p>
              </div>

              <div className="rounded-xl bg-[hsl(var(--muted))/40] p-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 font-medium">
                  <Wallet size={13} className="text-champagne" /> Budget Range
                </span>
                <p className="mt-1 font-semibold text-base text-emerald-600 dark:text-emerald-400">{c.budget || "Not specified"}</p>
              </div>

              <div className="rounded-xl bg-[hsl(var(--muted))/40] p-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 font-medium">
                  <Calendar size={13} className="text-champagne" /> Event Duration
                </span>
                <p className="mt-1 font-semibold text-base">{c.eventDays ? `${c.eventDays} Days` : "Not specified"}</p>
              </div>

              <div className="rounded-xl bg-[hsl(var(--muted))/40] p-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 font-medium">
                  <MapPin size={13} className="text-champagne" /> City & Venue
                </span>
                <p className="mt-1 font-semibold text-base">{c.location}</p>
              </div>
            </div>

            {/* Selected Events */}
            {c.events && c.events.length > 0 && (
              <div className="border-t pt-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] block mb-2 font-medium">Selected Wedding Functions</span>
                <div className="flex flex-wrap gap-2">
                  {c.events.map(ev => (
                    <span key={ev} className="rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-champagne border border-champagne/25">
                      ✨ {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {c.addOns && c.addOns.length > 0 && (
              <div className="border-t pt-3">
                <span className="text-xs text-[hsl(var(--muted-foreground))] block mb-2 font-medium">Requested Add-ons</span>
                <div className="flex flex-wrap gap-2">
                  {c.addOns.map(addon => (
                    <span key={addon} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ✓ {addon}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Timeline Section */}
          <section className="surface p-5">
            <p className="eyebrow">Wedding journey</p>
            <h2 className="mt-1 text-lg font-semibold">Timeline & Functions</h2>
            <div className="mt-5 space-y-0">
              {(c.timeline || []).map((item, i) => (
                <div className="flex gap-4" key={item.title + i}>
                  <div className="flex flex-col items-center">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-champagne text-xs font-bold text-white">{i + 1}</div>
                    {i < (c.timeline || []).length - 1 && <div className="h-10 w-px bg-[hsl(var(--border))]" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Message / Creative Direction */}
          <section className="surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Client message</p>
                <h2 className="mt-1 text-lg font-semibold">Message & Special Requests</h2>
              </div>
              <MessageSquareText className="text-champagne" size={20} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">
              {c.notes || "No additional notes specified."}
            </p>
          </section>
        </div>

        {/* Right column details */}
        <div className="space-y-6">
          <section className="surface p-5">
            <p className="eyebrow">Wedding details</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-[hsl(var(--muted-foreground))]">Main Date</dt>
                <dd className="mt-1 font-semibold">
                  {c.weddingDate ? new Date(c.weddingDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "TBD"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[hsl(var(--muted-foreground))]">Venue & Location</dt>
                <dd className="mt-1 flex gap-1.5 font-semibold">
                  <MapPin size={15} className="mt-0.5 text-champagne shrink-0" />{c.location}
                </dd>
              </div>
              {c.dressCode && (
                <div>
                  <dt className="text-xs text-[hsl(var(--muted-foreground))]">Dress Code</dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                    <Shirt size={15} className="text-champagne shrink-0" />{c.dressCode}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-[hsl(var(--muted-foreground))]">Package Choice</dt>
                <dd className="mt-1 font-semibold">{c.packageName || "Custom"} {c.price ? `· ${currency(c.price)}` : ""}</dd>
              </div>
            </dl>
          </section>

          <section className="surface p-5">
            <p className="eyebrow">Private access</p>
            <h2 className="mt-1 text-lg font-semibold">Client portal</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">A secure space for wedding details and questionnaires.</p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[hsl(var(--muted))] p-3">
              <span className="font-mono text-xs">/client/{c.portalCode}</span>
              <ClientDetailActions portalCode={c.portalCode} />
            </div>
          </section>

          <section className="surface overflow-hidden p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne/10 text-champagne">
                <UserPlus size={17} />
              </div>
              <div>
                <p className="eyebrow">Self-registration</p>
                <h2 className="mt-0.5 text-base font-semibold">Client self-update link</h2>
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              Share this link with {brideFirst} & {groomFirst}. They can manage their details & preferences directly.
            </p>
            <ClientDetailActions portalCode={c.portalCode} showRegLink />
          </section>
        </div>
      </div>
    </div>
  );
}
