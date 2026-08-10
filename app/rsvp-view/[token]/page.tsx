import { RsvpClientView } from "@/features/rsvp/rsvp-client-view";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <RsvpClientView portalCode={token} />;
}
