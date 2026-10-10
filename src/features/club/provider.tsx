import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { productContent } from './data';
import type { PointTransaction, Product, Profile, Redemption, RedemptionStatus } from './model';

interface Wallet { balance: number; earned: number; spent: number }
interface ClubContextValue {
 ready: boolean; user: Profile | null; isAdmin: boolean;
 wallet: Wallet; transactions: PointTransaction[]; redemptions: Redemption[];
 products: Product[]; productsError: string;
 refresh: () => Promise<void>; logout: () => Promise<void>;
 redeem: (productId: string, pixKey: string, requestKey: string) => Promise<string>;
 goal: string; setGoal: (id: string) => void;
}
const ClubContext = createContext<ClubContextValue | null>(null);
const emptyWallet: Wallet = { balance: 0, earned: 0, spent: 0 };

export function ClubProvider({ children }: { children: ReactNode }) {
 const [ready, setReady] = useState(false);
 const [user, setUser] = useState<Profile | null>(null);
 const [isAdmin, setIsAdmin] = useState(false);
 const [transactions, setTx] = useState<PointTransaction[]>([]);
 const [redemptions, setRed] = useState<Redemption[]>([]);
 const [products, setProducts] = useState<Product[]>([]);
 const [productsError, setProductsError] = useState('');
 const [goal, setGoal] = useState('pix-30');

 const loadProducts = useCallback(async () => {
  const { data, error } = await supabase.from('products').select('id,name,price,stock,active').order('price');
  if (error) { setProductsError('Não foi possível carregar as recompensas.'); return; }
  setProductsError('');
  setProducts((data ?? []).map(p => ({ ...p, category: 'Recompensas PIX', description: productContent[p.id]?.description ?? '', image: productContent[p.id]?.image ?? '', featured: !!productContent[p.id]?.featured })));
 }, []);

 const loadUser = useCallback(async () => {
  const { data: { user: au } } = await supabase.auth.getUser();
  if (!au) { setUser(null); setIsAdmin(false); setTx([]); setRed([]); return; }
  const [{ data: prof }, { data: admin }, { data: tx }, { data: red }] = await Promise.all([
   supabase.from('profiles').select('id,display_name,avatar_url,twitch_login,points').eq('id', au.id).maybeSingle(),
   supabase.rpc('has_role', { _user_id: au.id, _role: 'admin' }),
   supabase.from('point_transactions').select('*').eq('user_id', au.id).order('created_at', { ascending: false }).limit(200),
   supabase.from('redemptions').select('*').eq('user_id', au.id).order('created_at', { ascending: false }),
  ]);
  setUser(prof ? { id: prof.id, displayName: prof.display_name || prof.twitch_login || 'Player', avatarUrl: prof.avatar_url, twitchLogin: prof.twitch_login, points: prof.points } : null);
  setIsAdmin(admin === true);
  setTx((tx ?? []).map(t => ({ id: t.id, userId: t.user_id, amount: t.amount, reason: t.reason, date: t.created_at, idempotencyKey: t.idempotency_key, actor: t.actor })));
  setRed((red ?? []).map(r => ({ id: r.id, userId: r.user_id, productId: r.product_id, productName: r.product_name, cost: r.cost, date: r.created_at, status: r.status as RedemptionStatus })));
 }, []);

 const refresh = useCallback(async () => { await Promise.all([loadProducts(), loadUser()]); }, [loadProducts, loadUser]);

 useEffect(() => {
  refresh().finally(() => setReady(true));
  const { data: sub } = supabase.auth.onAuthStateChange(ev => {
   if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || ev === 'USER_UPDATED') void loadUser();
  });
  return () => sub.subscription.unsubscribe();
 }, [refresh, loadUser]);

 const earned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
 const spent = -transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
 const wallet = user ? { balance: user.points, earned, spent } : emptyWallet;

 async function redeem(productId: string, pixKey: string, requestKey: string) {
  const { data, error } = await supabase.rpc('redeem_pix', { _product_id: productId, _pix_key: pixKey, _request_key: requestKey });
  if (error) throw new Error(error.message);
  await refresh();
  return data as string;
 }
 async function logout() { await supabase.auth.signOut(); await loadUser(); }

 return <ClubContext.Provider value={{ ready, user, isAdmin, wallet, transactions, redemptions, products, productsError, refresh, logout, redeem, goal, setGoal }}>{children}</ClubContext.Provider>;
}
export function useClub() { const c = useContext(ClubContext); if (!c) throw new Error('ClubProvider required'); return c; }
