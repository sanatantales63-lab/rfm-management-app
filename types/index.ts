export type ClientStatus = "planning" | "confirmed" | "completed";
export type InvitationTheme = "royal-amber" | "midnight-garden" | "modern-ivory" | "blush-romance";

export interface Client {
  id: string;
  initials: string;
  clientName: string;
  brideName: string;
  groomName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  weddingDate: string;
  location: string;
  city?: string;
  packageName: string;
  price: number;
  status: ClientStatus;
  portalCode: string;
  timeline: TimelineItem[];
  notes?: string;
  dressCode?: string;
  eventDays?: string;
  guestCount?: string;
  budget?: string;
  addOns?: string[];
  referralSource?: string;
  preferredContact?: string;
  events?: string[];
}

export interface TimelineItem {
  title: string;
  date: string;
  type: "event" | "task" | "delivery";
  completed?: boolean;
}

export interface Invitation {
  id: string;
  slug: string;
  clientId?: string;
  brideName: string;
  groomName: string;
  date: string;
  venue: string;
  theme: InvitationTheme;
  color: string;
  dressCode?: string;
  mapEmbedUrl?: string;
}

export interface Rsvp {
  id: string;
  clientId?: string;
  name: string;
  phone: string;
  attending: boolean;
  events: string[];
  food: "Veg" | "Non Veg";
  members: number;
  notes?: string;
}
