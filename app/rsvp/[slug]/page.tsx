import { RsvpPublic } from "@/features/rsvp/rsvp-public";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RsvpPublic slug={slug} />;
}

