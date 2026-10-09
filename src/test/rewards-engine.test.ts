import { describe, expect, it } from 'vitest';
import { WeLoveMMORewardsEngine as engine } from '@/features/club/rewards-engine';
import { initialState } from '@/features/club/data';

describe('WeLoveMMO Rewards Engine — demo boundaries', () => {
  it('starts with a consistent wallet and complete illustrative ledger', () => {
    expect(initialState.transactions.reduce((sum,t)=>sum+t.amount,0)).toBe(initialState.wallet.balance);
    expect(initialState.wallet.earned-initialState.wallet.spent).toBe(initialState.wallet.balance);
  });
  it('calculates the illustrative rule without modifying a wallet', () => {
    expect(engine.calculatePoints(59)).toBe(0);
    expect(engine.calculatePoints(120)).toBe(200);
    expect(()=>engine.calculatePoints(-1)).toThrow();
  });
  it('registers a demo session only once and never credits a page view', () => {
    const session={id:'test-session',userId:'demo-player',streamId:'wl-main',minutes:60,source:'demo' as const,verified:false};
    const next=engine.registerSession(initialState,session);
    expect(next.wallet).toEqual(initialState.wallet);
    expect(engine.registerSession(next,session)).toBe(next);
    expect(()=>engine.registerSession(initialState,{...session,source:'verified-twitch',verified:true})).toThrow();
  });
  it('audits bonuses and blocks duplicate references, including whitespace', () => {
    const next=engine.registerBonus(initialState,250,'Evento','event-test');
    expect(next.wallet.balance).toBe(12700);
    expect(next.transactions[0]).toMatchObject({amount:250,actor:'demo-admin',idempotencyKey:'event-test'});
    expect(()=>engine.registerBonus(next,250,'Evento',' event-test ')).toThrow();
    expect(()=>engine.registerBonus(next,-13000,'Ajuste','negative')).toThrow();
    expect(()=>engine.registerBonus(next,Number.MAX_SAFE_INTEGER,'Overflow','overflow')).toThrow();
  });
  it('redeems atomically, decrements stock and records the player actor', () => {
    const next=engine.redeem(initialState,'special','redemption-test');
    expect(next.wallet.balance).toBe(7450);
    expect(next.products.find(p=>p.id==='special')?.stock).toBe(19);
    expect(next.redemptions).toHaveLength(1);
    expect(next.transactions[0].actor).toBe('demo-player');
    expect(()=>engine.redeem(next,'special','redemption-test')).toThrow();
    expect(initialState.wallet.balance).toBe(12450);
  });
  it('rejects insufficient balance, inactive rewards and invalid catalog values', () => {
    expect(()=>engine.redeem(initialState,'gpu','too-expensive')).toThrow();
    const product=initialState.products[0];
    const inactive=engine.saveProduct(initialState,{...product,active:false});
    expect(()=>engine.redeem(inactive,product.id,'inactive')).toThrow();
    expect(()=>engine.saveProduct(initialState,{...product,price:-1})).toThrow();
    expect(()=>engine.saveProduct(initialState,{...product,stock:-1})).toThrow();
    expect(()=>engine.saveProduct(initialState,{...product,image:'https://untrusted.example/image'})).toThrow();
  });
});