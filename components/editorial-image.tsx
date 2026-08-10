import { cn } from "@/lib/utils";

const scenes = {
  palace: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=86",
  ceremony: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=86",
  celebration: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=86"
} as const;

export function EditorialImage({ scene = "palace", className }: { scene?: keyof typeof scenes; className?: string }) {
  return <div className={cn("relative overflow-hidden bg-[#3a2a22]", className)}><div className="absolute inset-0 bg-cover bg-center transition duration-700 hover:scale-105" style={{ backgroundImage: `url(${scenes[scene]})` }} /><div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(234,190,139,.22),transparent_32%)]" /></div>;
}
