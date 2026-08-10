import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/* ─── Types ────────────────────────────────────────────── */
export interface CoverageDay {
  day: string;
  subtitle: string;
  crew: string[];
}

export interface Deliverable {
  category: string;
  icon: string;
  items: string[];
}

export interface SmartFeature {
  title: string;
  desc: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CustomField {
  label: string;
  icon: string;
  content: string;
}

export interface ProposalInvestment {
  total: number;
  advance: number;
  weddingDay: number;
  balance: number;
  description: string;
}

export interface ProposalContact {
  phone: string;
  email: string;
  instagram: string;
}

export interface Proposal {
  id: string;
  slug: string;
  bride_name: string;
  groom_name: string;
  wedding_dates: string[];
  tagline: string;
  coverage: CoverageDay[];
  investment: ProposalInvestment;
  deliverables: Deliverable[];
  smart_features: SmartFeature[];
  terms: string[];
  faq: FaqItem[];
  contact: ProposalContact;
  custom_fields: CustomField[];
  theme: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/* ─── Default content ──────────────────────────────────── */
export const DEFAULT_PROPOSAL: Omit<Proposal, "id" | "slug" | "created_at" | "updated_at"> = {
  bride_name: "",
  groom_name: "",
  wedding_dates: [],
  tagline:
    "We are honored to present this proposal for your wedding celebration. Our team is committed to capturing every heartfelt moment with artistry and care.",
  coverage: [
    {
      day: "Day 1",
      subtitle: "Haldi | Mehndi | Sangeet",
      crew: [
        "1 Traditional Photographer",
        "1 Traditional Videographer",
        "1 Candid Photographer",
        "1 Cinematographer",
        "2 Camera Assistants",
        "1 Drone Pilot",
        "1 Data Manager",
      ],
    },
    {
      day: "Day 2",
      subtitle: "Wedding Ceremony",
      crew: [
        "1 Traditional Photographer",
        "1 Traditional Videographer",
        "1 Candid Photographer",
        "1 Cinematographer",
        "2 Camera Assistants",
        "1 Drone Pilot",
        "1 Data Manager",
      ],
    },
  ],
  investment: {
    total: 150000,
    advance: 30,
    weddingDay: 60,
    balance: 10,
    description: "Complete photography & cinematography coverage",
  },
  deliverables: [
    {
      category: "Cinematic Films",
      icon: "Film",
      items: [
        "Haldi Cinematic Film",
        "Mehndi Cinematic Film",
        "Sangeet Cinematic Film",
        "Wedding Teaser",
        "Cinematic Wedding Highlight Film",
        "Full Wedding Movie (Approx. 30 Minutes)",
      ],
    },
    {
      category: "Instagram Reels",
      icon: "PlayCircle",
      items: ["Haldi Reel", "Mehndi Reel", "Sangeet Reel", "Bride Ready Reel", "Groom Ready Reel", "Wedding Reel"],
    },
    {
      category: "Wedding Albums",
      icon: "BookOpen",
      items: ["2 Premium Designer Albums (25+25 Sheets Each)", "2 Luxury Album Boxes"],
    },
    {
      category: "Photos & Videos",
      icon: "Image",
      items: [
        "Professionally Edited High-Resolution Photos",
        "Cinematically Edited Videos",
        "Complete RAW Photos & Videos of all events",
        "RAW data delivered on client-provided HDD/SSD",
      ],
    },
  ],
  smart_features: [
    { title: "AI-Powered Photo Selection", desc: "AI face recognition and smart selection software to find your best moments quickly." },
    { title: "Online Photo Selection Gallery", desc: "Browse, favorite, and choose album photos from any device." },
    { title: "Smart Face Scan", desc: "Fast and easy photo selection by face or person." },
    { title: "Secure Online Gallery", desc: "Password-protected client gallery for viewing and selecting." },
    { title: "Unlimited Sharing", desc: "Share your online gallery with family and friends freely." },
    { title: "High-Speed Digital Delivery", desc: "Fast digital delivery of edited photos and videos." },
  ],
  terms: [
    "Drone coverage is subject to weather conditions, venue policies, and local government permissions.",
    "Any additional coverage hours beyond the agreed schedule will be chargeable.",
    "Client will provide the Hard Drive (HDD/SSD) for RAW data delivery.",
    "RAW data will be handed over only after full payment is received.",
    "Edited files will be archived for a limited period. Clients are advised to maintain their own backup after delivery.",
    "Travel, accommodation, parking, tolls, and other outstation expenses (if applicable) will be borne by the client.",
    "Booking will be confirmed only after receipt of the advance payment.",
    "Album design will begin after the client finalizes photo selection through the Online Photo Selection Gallery.",
    "Delivery timelines are calculated from the date of the final event and receipt of complete payment.",
    "Any additional edits, revisions, or extra deliverables beyond the package will be chargeable.",
    "This quotation is valid for 7 days from the date of issue.",
  ],
  faq: [
    { q: "When will we receive our edited photos?", a: "Professionally edited photos are delivered within 45 days from the date of the final event and receipt of full payment." },
    { q: "When will we receive our cinematic films?", a: "Cinematic films are delivered within 60–90 days from the date of the final event." },
    { q: "Can we request specific shots or poses?", a: "Absolutely! We encourage you to share your shot list and preferences with us before the event so we can plan accordingly." },
    { q: "Do you travel outstation?", a: "Yes, we travel anywhere in India and internationally. Travel, accommodation, and related expenses are additional and borne by the client." },
    { q: "How do we confirm our booking?", a: "Your booking is confirmed upon receipt of the advance payment (30% of the total). We do not hold dates without confirmation." },
  ],
  contact: { phone: "", email: "", instagram: "" },
  custom_fields: [],
  theme: "royal-amber",
  is_published: false,
};

/* ─── Service functions — NO auth/RLS required ─────────── */

export async function getProposals(): Promise<Proposal[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const db = createClient();
    const { data, error } = await db
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Proposal[];
  } catch (e) {
    console.error("getProposals:", e);
    return [];
  }
}

export async function getProposalBySlug(slug: string): Promise<Proposal | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const db = createClient();
    const { data, error } = await db
      .from("proposals")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data as Proposal | null;
  } catch (e) {
    console.error("getProposalBySlug:", e);
    return null;
  }
}

export async function saveProposal(
  proposal: Omit<Proposal, "id" | "created_at" | "updated_at"> & { slug?: string }
): Promise<Proposal | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const db = createClient();

    // Generate slug from names if not provided
    const slug =
      proposal.slug ||
      `${proposal.bride_name.toLowerCase()}-${proposal.groom_name.toLowerCase()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    const payload = { ...proposal, slug };

    const { data, error } = await db
      .from("proposals")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

    if (error) throw error;
    return data as Proposal;
  } catch (e) {
    console.error("saveProposal:", e);
    return null;
  }
}

export async function deleteProposal(slug: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const db = createClient();
    const { error } = await db.from("proposals").delete().eq("slug", slug);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("deleteProposal:", e);
    return false;
  }
}

export async function togglePublish(slug: string, publish: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const db = createClient();
    const { error } = await db
      .from("proposals")
      .update({ is_published: publish })
      .eq("slug", slug);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("togglePublish:", e);
    return false;
  }
}
