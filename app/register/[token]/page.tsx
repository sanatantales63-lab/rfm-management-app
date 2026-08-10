import { ClientRegister } from '@/features/register/client-register';

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ClientRegister ownerToken={token} />;
}
