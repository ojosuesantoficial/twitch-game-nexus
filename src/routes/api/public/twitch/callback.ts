import { createFileRoute } from "@tanstack/react-router";

const ADMIN_EMAIL = "santsgodz@gmail.com";

export const Route = createFileRoute("/api/public/twitch/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const fail = (msg: string) =>
          new Response(null, { status: 302, headers: { Location: `${url.origin}/perfil?erro=${encodeURIComponent(msg)}` } });
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const cookieState = /(?:^|; )twitch_state=([^;]+)/.exec(request.headers.get("cookie") ?? "")?.[1];
        if (!code || !state || !cookieState || state !== cookieState) return fail("Login cancelado ou inválido.");

        const clientId = process.env["TWITCH_CLIENT_ID"];
        const clientSecret = process.env["TWITCH_CLIENT_SECRET"];
        if (!clientId || !clientSecret) return fail("Twitch não configurada.");

        const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: `${url.origin}/api/public/twitch/callback`,
          }),
        });
        if (!tokenRes.ok) {
          console.error("twitch token error", tokenRes.status, await tokenRes.text());
          return fail("Falha ao autenticar na Twitch.");
        }
        const { access_token } = (await tokenRes.json()) as { access_token: string };
        const userRes = await fetch("https://api.twitch.tv/helix/users", {
          headers: { Authorization: `Bearer ${access_token}`, "Client-Id": clientId },
        });
        if (!userRes.ok) return fail("Não foi possível ler seu perfil da Twitch.");
        const tu = ((await userRes.json()) as { data: { id: string; login: string; display_name: string; email?: string; profile_image_url?: string }[] }).data[0];
        if (!tu) return fail("Perfil da Twitch não encontrado.");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const synthetic = `twitch-${tu.id}@twitch.weloveMMO.club`.toLowerCase();
        const twitchEmail = tu.email?.toLowerCase();

        let userId: string | null = null;
        let email = synthetic;
        const { data: existing } = await supabaseAdmin.from("profiles").select("id").eq("twitch_id", tu.id).maybeSingle();
        if (existing) {
          userId = existing.id;
          const { data: u } = await supabaseAdmin.auth.admin.getUserById(existing.id);
          email = u.user?.email ?? synthetic;
        } else {
          for (const candidate of [synthetic]) {
            if (!candidate) continue;
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
              email: candidate,
              email_confirm: true,
              user_metadata: { display_name: tu.display_name, twitch_id: tu.id },
            });
            if (!error && data.user) { userId = data.user.id; email = candidate; break; }
          }
        }
        if (!userId) return fail("Não foi possível criar sua conta.");

        await supabaseAdmin.from("profiles").upsert(
          { id: userId, display_name: tu.display_name, avatar_url: tu.profile_image_url ?? null, twitch_id: tu.id, twitch_login: tu.login, email: twitchEmail ?? null },
          { onConflict: "id" },
        );
        const info = await fetch("https://id.twitch.tv/oauth2/userinfo", { headers: { Authorization: `Bearer ${access_token}` } });
        const claims = info.ok ? ((await info.json()) as { sub?: string; email?: string; email_verified?: boolean }) : {};
        const verifiedAdmin = claims.sub === tu.id && claims.email_verified === true && claims.email?.toLowerCase() === ADMIN_EMAIL;
        if (verifiedAdmin) {
          await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
        }

        const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
        if (linkErr || !link.properties?.hashed_token) return fail("Falha ao criar sessão.");
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${url.origin}/auth/callback?token_hash=${encodeURIComponent(link.properties.hashed_token)}`,
            "Set-Cookie": "twitch_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
          },
        });
      },
    },
  },
});
