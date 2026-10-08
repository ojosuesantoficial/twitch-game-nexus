import type { PointTransaction, Product, RewardsState, WatchSession } from './model';
/** WeLoveMMO Rewards Engine — DEMO ONLY.
 * Production boundary: replace these methods with authenticated server functions.
 * Verify signed EventSub messages and event IDs server-side, never browser timers.
 * Apply wallet + ledger + inventory atomically in a database transaction, with a
 * unique idempotency key. Check admin roles on the server, not email in the UI.
 */
export const WeLoveMMORewardsEngine = {
 calculatePoints(minutes:number) { if (!Number.isFinite(minutes) || minutes < 0) throw new Error('Tempo inválido.'); return Math.floor(minutes / 60) * 100; },
 registerSession(state:RewardsState,session:WatchSession):RewardsState {
  if(session.source !== 'demo' || session.verified) throw new Error('Sessões Twitch reais exigem validação no servidor.');
  if(!Number.isFinite(session.minutes) || session.minutes < 0 || session.userId !== state.wallet.userId) throw new Error('Sessão inválida.');
  if(state.sessions.some(s=>s.id===session.id)) return state;
  return {...state,sessions:[...state.sessions,session]}; // Recording alone NEVER credits points.
 },
 registerBonus(state:RewardsState,amount:number,reason:string,key:string):RewardsState {
  if(!Number.isSafeInteger(amount) || amount===0 || !reason.trim() || !key.trim()) throw new Error('Informe um ajuste inteiro, motivo e referência.');
  if(state.transactions.some(t=>t.idempotencyKey===key)) throw new Error('Esta referência já foi processada.');
  if(state.wallet.balance+amount < 0) throw new Error('O ajuste não pode deixar saldo negativo.');
  const transaction:PointTransaction={id:crypto.randomUUID(),userId:state.wallet.userId,amount,reason:`${reason} (demo)`,date:new Date().toISOString(),idempotencyKey:key,actor:'demo-admin'};
  return {...state,wallet:{...state.wallet,balance:state.wallet.balance+amount,earned:state.wallet.earned+Math.max(0,amount),spent:state.wallet.spent+Math.max(0,-amount)},transactions:[transaction,...state.transactions]};
 },
 redeem(state:RewardsState,productId:string,key:string):RewardsState {
  const product=state.products.find(p=>p.id===productId);
  if(!product?.active || product.stock<=0) throw new Error('Drop indisponível na demonstração.');
  if(state.wallet.balance<product.price) throw new Error('Points insuficientes para este drop.');
  const updated=this.registerBonus(state,-product.price,`Resgate · ${product.name}`,key);
  return {...updated,products:updated.products.map(p=>p.id===productId?{...p,stock:p.stock-1}:p),redemptions:[{id:crypto.randomUUID(),productId,productName:product.name,cost:product.price,date:new Date().toISOString(),status:'demo-confirmed'},...state.redemptions]};
 },
 saveProduct(state:RewardsState,product:Product):RewardsState {
  if(!product.name.trim() || !Number.isSafeInteger(product.price) || product.price<=0 || !Number.isSafeInteger(product.stock) || product.stock<0) throw new Error('Preencha nome, preço positivo e estoque válido.');
  if(!product.image.startsWith('/') && !product.image.startsWith('data:image/')) throw new Error('Use uma imagem local ou envie um arquivo.');
  const exists=state.products.some(p=>p.id===product.id);
  return {...state,products:exists?state.products.map(p=>p.id===product.id?product:p):[...state.products,product]};
 },
};
