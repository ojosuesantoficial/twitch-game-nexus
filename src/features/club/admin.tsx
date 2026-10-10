import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { PageHeading } from './components';
import { useClub } from './provider';
import { points } from './model';

interface Row { id: string; user_id: string; product_name: string; cost: number; pix_key: string; status: string; created_at: string }

export function AdminPage() {
 const { ready, isAdmin, products, refresh } = useClub();
 const [rows, setRows] = useState<Row[]>([]);
 const [msg, setMsg] = useState('');

 const load = useCallback(async () => {
  const { data, error } = await supabase.from('redemptions').select('id,user_id,product_name,cost,pix_key,status,created_at').order('created_at', { ascending: false }).limit(100);
  if (error) setMsg('Não foi possível carregar os resgates.'); else setRows(data ?? []);
 }, []);
 useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);

 async function review(id: string, status: 'approved' | 'rejected') {
  const { error } = await supabase.rpc('admin_review_redemption', { _id: id, _status: status });
  setMsg(error ? error.message : 'Resgate atualizado.'); await load();
 }
 async function toggle(id: string, active: boolean, stock: number) {
  const { error } = await supabase.rpc('admin_set_product', { _id: id, _active: active, _stock: stock });
  setMsg(error ? error.message : 'Produto atualizado.'); await refresh();
 }

 if (!ready) return <section className="container"><p>Carregando…</p></section>;
 if (!isAdmin) return <section className="container"><PageHeading eyebrow="Admin" title="Acesso restrito" description="Entre com a conta Twitch administradora." /></section>;

 return <section className="container">
  <PageHeading eyebrow="Admin" title="Painel do Club" description="Resgates PIX e recompensas." />
  {msg && <p>{msg}</p>}
  <h2>Resgates</h2>
  {rows.length === 0 ? <p>Nenhum resgate ainda.</p> : <table><thead><tr><th>Data</th><th>Recompensa</th><th>Custo</th><th>Chave PIX</th><th>Status</th><th /></tr></thead><tbody>
   {rows.map(r => <tr key={r.id}><td>{new Date(r.created_at).toLocaleString('pt-BR')}</td><td>{r.product_name}</td><td>{points(r.cost)}</td><td>{r.pix_key}</td><td>{r.status}</td><td>{r.status === 'pending' && <><Button size="sm" onClick={() => review(r.id, 'approved')}>Aprovar</Button> <Button size="sm" variant="secondary" onClick={() => review(r.id, 'rejected')}>Recusar</Button></>}</td></tr>)}
  </tbody></table>}
  <h2>Recompensas</h2>
  <table><thead><tr><th>Nome</th><th>Preço</th><th>Estoque</th><th>Status</th><th /></tr></thead><tbody>
   {products.map(p => <tr key={p.id}><td>{p.name}</td><td>{points(p.price)}</td><td>{p.stock}</td><td>{p.active ? 'Ativo' : 'Inativo'}</td><td><Button size="sm" variant="secondary" onClick={() => toggle(p.id, !p.active, p.stock)}>{p.active ? 'Desativar' : 'Ativar'}</Button></td></tr>)}
  </tbody></table>
 </section>;
}
