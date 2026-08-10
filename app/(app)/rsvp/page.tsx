import { Suspense } from "react";
import { RsvpDashboard } from "@/features/rsvp/rsvp-dashboard";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading RSVP dashboard...</div>}>
      <RsvpDashboard />
    </Suspense>
  );
}
