import { createServerFn } from '@tanstack/react-start';

export type LiveStatus =
 | { state: 'not-configured'; missing: string[] }
 | { state: 'error'; message: string }
 | { state: 'offline'; channel: string; displayName: string; offlineImage: string | null; profileImage: string | null }
 | { state: 'online'; channel: string; displayName: string; title: string; game: string; viewers: number; startedAt: string; thumbnail: string; profileImage: string | null };

// Public read of public Twitch channel data only (no user data, no secrets returned).
export const getLiveStatus = createServerFn({ method: 'GET' }).handler(async (): Promise<LiveStatus> => {
 const clientId = process.env['TWITCH_CLIENT_ID'];
 const clientSecret = process.env['TWITCH_CLIENT_SECRET'];
 const channel = process.env['TWITCH_CHANNEL_LOGIN']?.trim().toLowerCase();
 const missing = [!clientId && 'TWITCH_CLIENT_ID', !clientSecret && 'TWITCH_CLIENT_SECRET', !channel && 'TWITCH_CHANNEL_LOGIN'].filter(Boolean) as string[];
 if (!clientId || !clientSecret || !channel) return { state: 'not-configured', missing };
 try {
  const tok = await fetch('https://id.twitch.tv/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }) });
  if (!tok.ok) return { state: 'error', message: 'A Twitch recusou as credenciais do app.' };
  const { access_token } = (await tok.json()) as { access_token: string };
  const h = { Authorization: `Bearer ${access_token}`, 'Client-Id': clientId };
  const [uRes, sRes] = await Promise.all([
   fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(channel)}`, { headers: h }),
   fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel)}`, { headers: h }),
  ]);
  if (!uRes.ok || !sRes.ok) return { state: 'error', message: 'Não foi possível consultar a Twitch agora.' };
  const u = ((await uRes.json()) as { data: { display_name: string; offline_image_url: string; profile_image_url: string }[] }).data[0];
  if (!u) return { state: 'error', message: 'Canal configurado não encontrado na Twitch.' };
  const s = ((await sRes.json()) as { data: { title: string; game_name: string; viewer_count: number; started_at: string; thumbnail_url: string }[] }).data[0];
  if (!s) return { state: 'offline', channel, displayName: u.display_name, offlineImage: u.offline_image_url || null, profileImage: u.profile_image_url || null };
  return { state: 'online', channel, displayName: u.display_name, title: s.title, game: s.game_name, viewers: s.viewer_count, startedAt: s.started_at, thumbnail: s.thumbnail_url.replace('{width}', '1280').replace('{height}', '720'), profileImage: u.profile_image_url || null };
 } catch {
  return { state: 'error', message: 'Falha de conexão com a Twitch.' };
 }
});
