import { ClientPortal } from "@/features/portal/client-portal";
export default async function Page({params}:{params:Promise<{code:string}>}){const {code}=await params;return <ClientPortal code={code}/>}
