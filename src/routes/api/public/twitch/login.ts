import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/twitch/login")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = process.env["TWITCH_CLIENT_ID"];
        if (!clientId) return new Response("Twitch não configurada", { status: 500 });
        const url = new URL(request.url);
        const state = crypto.randomUUID();
        const redirectUri = `${url.origin}/api/public/twitch/callback`;
        const auth = new URL("https://id.twitch.tv/oauth2/authorize");
        auth.searchParams.set("client_id", clientId);
        auth.searchParams.set("redirect_uri", redirectUri);
        auth.searchParams.set("response_type", "code");
        auth.searchParams.set("scope", "user:read:email");
        auth.searchParams.set("state", state);
        return new Response(null, {
          status: 302,
          headers: {
            Location: auth.toString(),
            "Set-Cookie": `twitch_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
          },
        });
      },
    },
  },
});
