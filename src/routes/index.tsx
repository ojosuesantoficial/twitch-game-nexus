import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WeLoveMMO Club — Você assiste. Você acumula. Você conquista." },
      { name: "description", content: "Transforme o tempo nas lives do WeLoveMMO Club em Points e desbloqueie recompensas." },
      { property: "og:title", content: "WeLoveMMO Club" },
      { property: "og:description", content: "Você já ia assistir. Agora seu tempo vale recompensa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const products = [
  { name: "Mouse Gamer SteelSeries", price: 20000 },
  { name: "Teclado Mecânico", price: 30000 },
  { name: "Headset Gamer", price: 25000 },
  { name: "SSD", price: 40000 },
  { name: "Placa de vídeo", price: 150000 },
];
const balance = 12450;
const fmt = (n: number) => n.toLocaleString("pt-BR");

function Index() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-lg font-black">WeLoveMMO <span className="text-primary">Club</span></span>
        <span className="rounded-full border border-primary/40 px-3 py-1 text-sm font-bold text-primary">💎 {fmt(balance)} WMMO <span className="text-muted-foreground">(demo)</span></span>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-black md:text-6xl">VOCÊ ASSISTE. VOCÊ ACUMULA. <span className="text-primary">VOCÊ CONQUISTA.</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">Transforme o tempo que você passa nas lives do WeLoveMMO Club em Points e use suas conquistas para desbloquear recompensas.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="https://discord.gg/RNbrSGKYZg" className="rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground">COMEÇAR A ACUMULAR POINTS</a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Demonstração: a contagem real de tempo assistido depende da futura integração com a Twitch.</p>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-black">QUAL É O SEU <span className="text-primary">PRÓXIMO DROP?</span></h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const missing = Math.max(0, p.price - balance);
            return (
              <div key={p.name} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-bold">{p.name}</h3>
                <p className="mt-1 text-xl font-black text-primary">{fmt(p.price)} WMMO</p>
                <div className="mt-3 h-2 rounded bg-muted"><div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, (balance / p.price) * 100)}%` }} /></div>
                <p className="mt-2 text-sm text-muted-foreground">Faltam <span className="text-primary">{fmt(missing)}</span> WMMO</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
