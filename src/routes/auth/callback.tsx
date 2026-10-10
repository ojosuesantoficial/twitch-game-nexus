import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Entrando com a Twitch · WeLoveMMO Club" }, { name: "robots", content: "noindex" }] }),
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();
  useEffect(() => {
    const token_hash = new URLSearchParams(window.location.search).get("token_hash");
    if (!token_hash) { navigate({ to: "/perfil" }); return; }
    supabase.auth.verifyOtp({ token_hash, type: "magiclink" }).then(({ error }) => {
      if (error) window.location.replace("/perfil?erro=" + encodeURIComponent("Sessão expirada. Tente entrar novamente.")); else navigate({ to: "/perfil" });
    });
  }, [navigate]);
  return <div className="container page-content">Entrando com a Twitch…</div>;
}
