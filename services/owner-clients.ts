import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Client } from "@/types";

export interface OwnerClientData {
  clientName: string;
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  familyContact?: string;
  weddingDate: string;
  haldiDate?: string;
  mehnadiDate?: string;
  sangeetDate?: string;
  baraatTiming?: string;
  packageName: string;
  packageDays: string;
  price: number;
  location: string;
  dressCode?: string;
  droneRequired?: boolean;
  cinematicRequired?: boolean;
  notes?: string;
  status?: "planning" | "confirmed" | "completed";
}

export type FullOwnerClient = Client & {
  familyContact?: string;
  haldiDate?: string;
  mehnadiDate?: string;
  sangeetDate?: string;
  baraatTiming?: string;
  packageDays?: string;
  droneRequired?: boolean;
  cinematicRequired?: boolean;
};

const TABLE = "owner_clients";
const LOCAL_STORAGE_KEY = "rfm_owner_clients_only";

export function getLocalOwnerClients(): FullOwnerClient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalOwnerClient(c: FullOwnerClient): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalOwnerClients();
    const updated = [c, ...existing.filter(i => i.id !== c.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function deleteLocalOwnerClient(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalOwnerClients();
    const updated = existing.filter(i => i.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function mapOwnerClientRow(row: any): FullOwnerClient {
  const bride = row.bride_name || "";
  const groom = row.groom_name || "";
  const brideFirst = bride.split(" ")[0] || "";
  const groomFirst = groom.split(" ")[0] || "";
  const initials = `${brideFirst[0] ?? "?"}${groomFirst[0] ?? "?"}`.toUpperCase();

  const name = row.client_name || (bride && groom ? `${bride} & ${groom}` : `Client #${row.id}`);

  return {
    id: String(row.id),
    initials,
    clientName: name,
    brideName: bride,
    groomName: groom,
    email: row.email || "",
    phone: row.phone || "",
    familyContact: row.family_contact || row.familyContact || "",
    weddingDate: row.wedding_date || "",
    haldiDate: row.haldi_date || row.haldiDate || "",
    mehnadiDate: row.mehndi_date || row.mehnadiDate || "",
    sangeetDate: row.sangeet_date || row.sangeetDate || "",
    baraatTiming: row.baraat_timing || row.baraatTiming || "",
    location: row.location || row.venue || row.city || "Venue TBD",
    packageName: row.package_name || row.package_choice || "Essential",
    packageDays: String(row.package_days || row.packageDays || "1"),
    price: Number(row.price || 0),
    droneRequired: row.drone_required ?? row.droneRequired ?? true,
    cinematicRequired: row.cinematic_required ?? row.cinematicRequired ?? true,
    status: row.status || "planning",
    portalCode: row.portal_code || String(row.id),
    notes: row.notes || row.message || "",
    dressCode: row.dress_code || undefined,
    timeline: [
      { title: "Wedding ceremony", date: row.wedding_date || "TBD", type: "event" as const },
    ],
  };
}

export async function getOwnerClients(): Promise<FullOwnerClient[]> {
  const localList = getLocalOwnerClients();
  if (!isSupabaseConfigured()) return localList;
  try {
    const db = createClient();
    const { data, error } = await db.from(TABLE).select("*").order("created_at", { ascending: false });
    if (!error && data) {
      const remoteList = data.map(mapOwnerClientRow);
      const ids = new Set(remoteList.map(r => r.id));
      return [...remoteList, ...localList.filter(l => !ids.has(l.id))];
    }
    return localList;
  } catch (e) {
    console.error("getOwnerClients exception:", e);
    return localList;
  }
}

export async function createOwnerClient(data: OwnerClientData): Promise<FullOwnerClient | null> {
  const localClient: FullOwnerClient = {
    id: `owner-${Date.now()}`,
    initials: `${(data.brideName[0] || "?")}${(data.groomName[0] || "?")}`.toUpperCase(),
    clientName: data.clientName,
    brideName: data.brideName,
    groomName: data.groomName,
    email: data.email,
    phone: data.phone,
    familyContact: data.familyContact || "",
    weddingDate: data.weddingDate || "",
    haldiDate: data.haldiDate || "",
    mehnadiDate: data.mehnadiDate || "",
    sangeetDate: data.sangeetDate || "",
    baraatTiming: data.baraatTiming || "",
    location: data.location,
    packageName: data.packageName,
    packageDays: data.packageDays,
    price: Number(data.price || 0),
    droneRequired: data.droneRequired ?? true,
    cinematicRequired: data.cinematicRequired ?? true,
    status: data.status || "planning",
    portalCode: `OWNER${Date.now().toString().slice(-4)}`,
    notes: data.notes || "",
    dressCode: data.dressCode,
    timeline: [
      { title: "Wedding ceremony", date: data.weddingDate || "TBD", type: "event" as const },
    ],
  };

  if (!isSupabaseConfigured()) {
    saveLocalOwnerClient(localClient);
    return localClient;
  }

  const db = createClient();
  const payload = {
    client_name: data.clientName,
    bride_name: data.brideName,
    groom_name: data.groomName,
    email: data.email,
    phone: data.phone,
    family_contact: data.familyContact || "",
    wedding_date: data.weddingDate || null,
    haldi_date: data.haldiDate || null,
    mehndi_date: data.mehnadiDate || null,
    sangeet_date: data.sangeetDate || null,
    baraat_timing: data.baraatTiming || "",
    location: data.location,
    package_name: data.packageName,
    package_days: data.packageDays,
    price: data.price,
    dress_code: data.dressCode || "",
    drone_required: data.droneRequired ?? true,
    cinematic_required: data.cinematicRequired ?? true,
    notes: data.notes || "",
    status: data.status || "planning",
  };

  try {
    const { data: inserted, error } = await db.from(TABLE).insert([payload]).select().single();
    if (!error && inserted) {
      const created = mapOwnerClientRow(inserted);
      saveLocalOwnerClient(created);
      return created;
    }

    console.warn("owner_clients table insert warning:", error?.message);
    saveLocalOwnerClient(localClient);
    return localClient;
  } catch (err) {
    console.error("createOwnerClient exception:", err);
    saveLocalOwnerClient(localClient);
    return localClient;
  }
}

export async function deleteOwnerClient(id: string): Promise<boolean> {
  deleteLocalOwnerClient(id);
  if (!isSupabaseConfigured()) return true;
  try {
    const db = createClient();
    await db.from(TABLE).delete().eq("id", id);
    return true;
  } catch (err) {
    console.error("deleteOwnerClient error:", err);
    return true;
  }
}
