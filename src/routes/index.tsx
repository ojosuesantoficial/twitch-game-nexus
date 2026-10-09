import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

const REWARDS = [
  { id: 1, name: "Pix R$ 30", cost: 150000, value: 30 },
  { id: 2, name: "Pix R$ 80", cost: 160000, value: 80 },
  { id: 3, name: "Pix R$ 100", cost: 190000, value: 100 },
];

function Index() {
  const [session, setSession] = useState<any>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithTwitch = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "twitch",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">Carregando...</div>;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-center">Sistema de Recompensas</h1>
        <div className="max-w-sm w-full rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl">
          <h2 className="mb-4 text-xl font-semibold">Entre para resgatar</h2>
          <p className="mb-6 text-sm text-zinc-400">
            Conecte sua conta da Twitch para ver seus pontos e resgatar prêmios via Pix.
          </p>
          <button
            onClick={loginWithTwitch}
            className="w-full rounded-md bg-[#9146FF] px-4 py-2 font-medium text-white transition-colors hover:bg-[#772ce8]"
          >
            Entrar com a Twitch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-50 sm:p-12">
      <header className="mx-auto mb-12 flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Bem-vindo(a)!</h1>
          <p className="text-zinc-400">{session.user?.email || "Jogador"}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-400">Seus Pontos</p>
            <p className="text-3xl font-bold text-emerald-400">{points.toLocaleString("pt-BR")}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700 hover:text-zinc-50"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-xl font-semibold">Recompensas Disponíveis (Pix)</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REWARDS.map((reward) => (
            <div
              key={reward.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-all hover:border-zinc-700 hover:shadow-md"
            >
              <div>
                <h3 className="text-2xl font-bold text-zinc-100">{reward.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">Resgate na hora em sua conta.</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-semibold text-emerald-400">
                  {reward.cost.toLocaleString("pt-BR")} pts
                </span>
                <button
                  disabled={points < reward.cost}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  Resgatar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
