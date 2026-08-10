import { PublicInvitation } from "@/features/invitations/invitation-pages";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicInvitation slug={slug} />;
}
