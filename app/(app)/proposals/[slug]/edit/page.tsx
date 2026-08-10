import { ProposalBuilder } from "@/features/proposals/proposal-pages";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProposalBuilder existingSlug={slug} />;
}
