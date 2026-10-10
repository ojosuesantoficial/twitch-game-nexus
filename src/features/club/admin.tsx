import { useEffect, useState, type FormEvent } from 'react';
import { Users, Gem, Gift, Package, ShieldCheck, Check, X, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, DemoNotice } from './components';
import { Stat, TransactionTable } from './pages';
import { useClub } from './provider';
import { points, statusLabel, type RedemptionStatus } from './model';
import { supabase } from '@/integrations/supabase/client';

interface AdminRedemption { id: string; user_id: string; product_name: string; cost: number; status: RedemptionStatus; created_at: string; pix_key: string }
interface AdminProfile { id: string; display_name: string; twitch_login: string | null; points: number }

export function AdminPage() {
 const { user, isAdmin, ready, refresh, products } = useClub();
 const [tab, setTab] = useState<'resgates' | 'points' | 'produtos'>('resgates');
 const [redemptions, setRedemptions] = useState<AdminRedemption[] | null>(null);
 const [profiles, setProfiles] = useState<AdminProfile[] | null>(null);
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [amount, setAmount] = useState('250');
 const [reason, setReason] = useState('');
 const [reference, setReference] = useState('');
 const [targetUser, setTargetUser] = useState('');
 const [stockEdit, setStockEdit] = useState<Record<string, string>>({});

 const load = async () => {
  const [{ data: red }, { data: prof }] = await Promise.all([
   supabase.from('redemptions').select('id,user_id,product_name,cost,status,created_at,pix_key').order('created_at', { ascending: false }),
   supabase.from('profiles').select('id,display_name,twitch_login,points').order('created_at', { ascending: false }).limit(100),
  ]);
  setRedemptions((red ?? []) as AdminRedemption[]); setProfiles(prof ?? []);
 };
 useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

 if (!ready) return <div className="container page-content"><p>Verificando acesso…</p></div>;
 if (!user) return <div className="container page-content empty-state"><ShieldCheck size={35}/><h1>Entre com a Twitch para acessar.</h1><Button asChild><a href="/api/public/twitch/login">LOGIN COM TWITCH</a></Button></div>;
 if (!isAdmin) return <div className="container page-content empty-state"><ShieldCheck size={35}/><h1>Acesso restrito à administração.</h1><p>Sua conta não tem permissão de administrador no Club.</p></div>;

 async function review(id: string, status: 'paid' | 'rejected') {
  setError(''); setMessage('');
  const { error: e } = await supabase.rpc('admin_review_redemption', { _id: id, _status: status });
  if (e) setError(e.message); else { setMessage(status === 'paid' ? 'Resgate marcado como pago.' : 'Resgate recusado e Points estornados.'); await load(); await refresh(); }
 }
 async function adjust(e: FormEvent) {
  e.preventDefault(); setError(''); setMessage('');
  if (!targetUser) { setError('Escolha o player.'); return; }
  const { error: err } = await supabase.rpc('admin_adjust_points', { _user: targetUser, _amount: Number(amount), _reason: reason, _key: reference });
  if (err) setError(err.message); else { setMessage('Ajuste aplicado e registrado na auditoria.'); setReference(''); setReason(''); await load(); }
 }
 async function setProduct(id: string, active: boolean) {
  setError(''); setMessage('');
  const stock = Number(stockEdit[id]);
  if (!Number.isInteger(stock) || stock < 0) { setError('Informe um estoque válido.'); return; }
  const { error: err } = await supabase.rpc('admin_set_product', { _id: id, _stock: stock, _active: active });
  if (err) setError(err.message); else { setMessage('Produto atualizado.'); await refresh(); }
 }

 const pending = (redemptions ?? []).filter(r => r.status === 'pending');

 return <div className="container page-content"><PageHeading eyebrow="CENTRAL DE OPERAÇÕES" title="Painel Administrativo" description="Dados reais do Club. Toda ação fica registrada na auditoria."/><DemoNotice>Pagamentos PIX são enviados manualmente por você após marcar o resgate como pago.</DemoNotice>
 <div className="admin-tabs">
  <Button variant={tab==='resgates'?'default':'ghost'} onClick={()=>setTab('resgates')}><Gift/>Resgates {pending.length>0&&`(${pending.length})`}</Button>
  <Button variant={tab==='points'?'default':'ghost'} onClick={()=>setTab('points')}><Gem/>Points</Button>
  <Button variant={tab==='produtos'?'default':'ghost'} onClick={()=>setTab('produtos')}><Package/>Produtos</Button>
 </div>
 {message&&<div role="status" className="success-state"><ShieldCheck/>{message}</div>}
 {error&&<p role="alert" className="form-error">{error}</p>}

 {tab==='resgates'&&<>{redemptions===null?<p>Carregando…</p>:redemptions.length===0?<div className="empty-state"><Gift size={32}/><h2>Nenhum resgate até agora.</h2><p>Quando um player resgatar um PIX, o pedido aparece aqui para sua revisão.</p></div>:<div className="table-scroll"><table><thead><tr><th>RECOMPENSA</th><th>CHAVE PIX</th><th>DATA</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>{redemptions.map(r=><tr key={r.id}><td>{r.product_name}<small className="audit-ref">{points(r.cost)} WMMO</small></td><td>{r.pix_key}</td><td>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td><td><span className={`status-tag ${r.status==='pending'?'':'active'}`}>{statusLabel[r.status]}</span></td><td>{r.status==='pending'&&<div className="table-actions"><Button size="sm" onClick={()=>review(r.id,'paid')}><Check/> PAGO</Button><Button size="sm" variant="ghost" onClick={()=>review(r.id,'rejected')}><X/> RECUSAR</Button></div>}</td></tr>)}</tbody></table></div>}</>}

 {tab==='points'&&<><form onSubmit={adjust} className="adjustment-form"><div><span className="eyebrow">AJUSTE OU BÔNUS DE POINTS</span><h2>Creditar ou debitar WMMO</h2><p>Valores negativos descontam. Motivo e referência são obrigatórios; referências repetidas são bloqueadas.</p></div><label>Player<select value={targetUser} onChange={e=>setTargetUser(e.target.value)} required><option value="">Escolher…</option>{(profiles??[]).map(p=><option key={p.id} value={p.id}>{p.display_name} {p.twitch_login?`(@${p.twitch_login})`:''} — {points(p.points)} WMMO</option>)}</select></label><label>Points<input type="number" step="1" value={amount} required onChange={e=>setAmount(e.target.value)}/></label><label>Motivo<input value={reason} required onChange={e=>setReason(e.target.value)} placeholder="Bônus de evento"/></label><label>Referência única<input value={reference} required onChange={e=>setReference(e.target.value)} placeholder="evento-001"/></label><Button type="submit"><Gem/> APLICAR AJUSTE</Button></form><h2 className="subheading">Players cadastrados</h2>{profiles===null?<p>Carregando…</p>:profiles.length===0?<div className="empty-state"><Users size={32}/><h2>Nenhum player cadastrado ainda.</h2></div>:<div className="table-scroll"><table><thead><tr><th>PLAYER</th><th>TWITCH</th><th>SALDO</th></tr></thead><tbody>{profiles.map(p=><tr key={p.id}><td>{p.display_name}</td><td>{p.twitch_login?`@${p.twitch_login}`:'—'}</td><td className="text-primary">{points(p.points)} WMMO</td></tr>)}</tbody></table></div>}</>}

 {tab==='produtos'&&<div className="table-scroll"><table><thead><tr><th>RECOMPENSA</th><th>POINTS</th><th>ESTOQUE</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.name}</td><td className="text-primary">{points(p.price)}</td><td><input type="number" min="0" step="1" style={{width:90}} value={stockEdit[p.id] ?? String(p.stock)} onChange={e=>setStockEdit(s=>({...s,[p.id]:e.target.value}))}/></td><td><span className={`status-tag ${p.active?'active':''}`}>{p.active?'Ativo':'Inativo'}</span></td><td><div className="table-actions"><Button size="sm" variant="outline" onClick={()=>setProduct(p.id,p.active)}>SALVAR</Button><Button size="icon" variant="ghost" title={p.active?'Desativar':'Ativar'} aria-label={`${p.active?'Desativar':'Ativar'} ${p.name}`} onClick={()=>setProduct(p.id,!p.active)}><Power/></Button></div></td></tr>)}</tbody></table></div>}
 </div>;
}
