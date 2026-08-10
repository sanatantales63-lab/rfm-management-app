import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProposalPublicPage } from "@/features/proposals/proposal-pages";
import type { Proposal } from "@/services/proposals";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProposal(slug: string): Promise<Proposal | null> {
  try {
    const db = createClient();
    const { data } = await db
      .from("proposals")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data as Proposal | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const proposal = await getProposal(slug);
  if (!proposal) return { title: "Proposal | RFM Wedding Photography" };
  return {
    title: `${proposal.bride_name} & ${proposal.groom_name} | RFM Wedding Photography`,
    description: `Personalized proposal for ${proposal.bride_name} & ${proposal.groom_name}'s wedding.`,
    openGraph: {
      title: `${proposal.bride_name} & ${proposal.groom_name} | Wedding Proposal`,
      description: proposal.tagline,
    },
  };
}

export default async function ProposalPage({ params }: Props) {
  const { slug } = await params;
  const proposal = await getProposal(slug);
  if (!proposal) notFound();
  return <ProposalPublicPage proposal={proposal} />;
}
