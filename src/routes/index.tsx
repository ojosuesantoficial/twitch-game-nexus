import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WeLoveMMO Club — Seu tempo vale recompensa" },
      { name: "description", content: "Assista às lives do WeLoveMMO Club, acumule WMMO Points e conquiste recompensas (MVP demonstrativo)." },
      { property: "og:title", content: "WeLoveMMO Club — Seu tempo vale recompensa" },
      { property: "og:description", content: "Você assiste. Você acumula. Você conquista." },
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
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <span className="text-lg font-black tracking-wider">WeLoveMMO <span className="text-primary">Club</span></span>
        <span className="rounded-full border border-primary/40 px-3 py-1 text-sm font-bold text-primary">💎 {fmt(balance)} WMMO</span>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">MVP demonstrativo · Twitch ainda não conectada</p>
        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          VOCÊ ASSISTE. VOCÊ ACUMULA. <span className="text-primary">VOCÊ CONQUISTA.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Transforme o tempo que você passa nas lives do WeLoveMMO Club em <span className="text-primary font-bold">Points</span> e use suas conquistas para desbloquear recompensas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="https://discord.gg/RNbrSGKYZg" target="_blank" rel="noreferrer" className="rounded-md bg-primary px-6 py-3 font-black text-primary-foreground">ENTRAR NO DISCORD</a>
        </div>
        <h2 className="mt-16 text-2xl font-black">Qual é o seu <span className="text-primary">próximo drop?</span></h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const pct = Math.min(100, (balance / p.price) * 100);
            return (
              <div key={p.name} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-bold uppercase">{p.name}</h3>
                <p className="mt-2 text-2xl font-black text-primary">{fmt(p.price)} WMMO</p>
                <div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                <p className="mt-2 text-sm text-muted-foreground">Faltam <span className="font-bold text-primary">{fmt(p.price - balance)}</span> WMMO</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
