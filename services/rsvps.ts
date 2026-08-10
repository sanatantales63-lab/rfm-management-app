import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface RsvpSubmission {
  clientId: string;
  guestName: string;
  phone: string;
  attending: boolean;
  events: string[];
  foodPreference: "veg" | "non_veg";
  membersComing: number;
  specialNotes?: string;
}

export async function submitRsvp(submission: RsvpSubmission) {
  if (!isSupabaseConfigured()) return;
  const db = createClient();

  const payload = {
    client_id: String(submission.clientId),
    guest_name: submission.guestName,
    phone: submission.phone,
    attending: submission.attending,
    events: submission.events,
    food_preference: submission.foodPreference,
    members_coming: submission.membersComing,
    special_notes: submission.specialNotes ?? "",
  };

  try {
    const { error } = await db.from("rsvps").insert([payload]);
    if (error) {
      console.error("Supabase RSVP insert error:", error.message);
    } else {
      console.log("✅ RSVP saved to Supabase with client_id:", submission.clientId);
    }
  } catch (e) {
    console.error("Supabase RSVP submit exception:", e);
  }
}

export async function fetchAllSupabaseRsvps() {
  if (!isSupabaseConfigured()) return [];
  try {
    const db = createClient();
    const { data, error } = await db
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row: any) => ({
      id: String(row.id),
      clientId: String(row.client_id || ""),
      name: row.guest_name || "Guest",
      phone: row.phone || "",
      attending: row.attending ?? true,
      events: Array.isArray(row.events) ? row.events : ["Wedding"],
      food:
        row.food_preference === "non_veg" || row.food_preference === "Non Veg"
          ? ("Non Veg" as const)
          : ("Veg" as const),
      members: Number(row.members_coming || 1),
      notes: row.special_notes || "",
      createdAt: row.created_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function deleteRsvpById(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const db = createClient();
    const { error } = await db.from("rsvps").delete().eq("id", id);
    if (error) {
      console.error("Delete RSVP error:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function getRsvpsByClientId(clientId: string) {
  const all = await fetchAllSupabaseRsvps();
  return all.filter((r) => r.clientId === clientId);
}
