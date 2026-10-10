export interface Product { id: string; name: string; description: string; category: string; price: number; stock: number; featured: boolean; active: boolean; image: string }
export interface Profile { id: string; displayName: string; avatarUrl: string | null; twitchLogin: string | null; points: number }
export interface PointTransaction { id: string; amount: number; reason: string; date: string; idempotencyKey: string; actor: string; userId: string }
export type RedemptionStatus = 'pending' | 'paid' | 'rejected';
export interface Redemption { id: string; productId: string; productName: string; cost: number; date: string; status: RedemptionStatus; userId: string; pixKey?: string }
export interface Member { displayName: string; avatarUrl: string | null; twitchLogin: string | null; points: number }
export const points = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
export const categories = ['Recompensas PIX'];
export const statusLabel: Record<RedemptionStatus, string> = { pending: 'Em análise pela equipe', paid: 'PIX enviado', rejected: 'Recusado · Points estornados' };
/** Nível derivado apenas de Points WMMO creditados e confirmados no backend. */
export const LEVEL_STEP = 15000;
export const levelFromEarned = (earned: number) => Math.floor(earned / LEVEL_STEP);
export const initials = (name: string) => name.split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?';
