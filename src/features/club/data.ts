import pix30 from '@/assets/products/pix-30.jpg.asset.json';
import pix80 from '@/assets/products/pix-80.jpg.asset.json';
import pix100 from '@/assets/products/pix-100.jpg.asset.json';
import type { Product, RewardsState, Stream, ClubEvent } from './model';
export const initialProducts: Product[] = [
 { id:'pix-30', name:'Sorteio PIX R$30', category:'Recompensas especiais', price:100000, stock:50, featured:true, active:true, image:pix30.url, description:'Participe do sorteio de um PIX de R$30. Pagamento revisado e enviado manualmente pela equipe WeLoveMMO.' },
 { id:'pix-80', name:'PIX R$80', category:'Recompensas especiais', price:150000, stock:20, featured:false, active:true, image:pix80.url, description:'Resgate um PIX de R$80. Pagamento revisado e enviado manualmente pela equipe WeLoveMMO.' },
 { id:'pix-100', name:'PIX R$100', category:'Recompensas especiais', price:190000, stock:20, featured:false, active:true, image:pix100.url, description:'Resgate um PIX de R$100. Pagamento revisado e enviado manualmente pela equipe WeLoveMMO.' },
];
export const initialState: RewardsState = {
 wallet:{userId:'demo-player',balance:12450,earned:17450,spent:5000},
 products:initialProducts,
 transactions:[
 {id:'tx1',userId:'demo-player',amount:100,reason:'Live WeLoveMMO · 60 minutos (demo)',date:'2026-10-08T01:00:00Z',idempotencyKey:'seed-1',actor:'demo-seed'},
 {id:'tx2',userId:'demo-player',amount:250,reason:'Evento especial (demo)',date:'2026-10-08T00:30:00Z',idempotencyKey:'seed-2',actor:'demo-seed'},
 {id:'tx4',userId:'demo-player',amount:500,reason:'Bônus de jornada (demo)',date:'2026-10-08T00:00:00Z',idempotencyKey:'seed-4',actor:'demo-seed'},
 {id:'tx3',userId:'demo-player',amount:-5000,reason:'Resgate histórico · Mouse Gamer (preço demo anterior)',date:'2026-10-06T18:00:00Z',idempotencyKey:'seed-3',actor:'demo-seed'},
 {id:'tx0',userId:'demo-player',amount:16600,reason:'Saldo acumulado inicial (demo)',date:'2026-10-05T18:00:00Z',idempotencyKey:'seed-opening',actor:'demo-seed'},
 ],
 sessions:[{id:'ws1',userId:'demo-player',streamId:'wl-main',minutes:402,source:'demo',verified:false}],redemptions:[],
};
export const streams: Stream[] = [{id:'wl-main',title:'A próxima conquista começa aqui.',game:'World of Warcraft',viewers:1248,status:'demo-online'}];
export const events: ClubEvent[] = [{id:'event1',name:'Raid Night · Points em dobro',bonus:250,status:'upcoming'},{id:'event2',name:'Encontro da comunidade',bonus:100,status:'upcoming'}];
export const ranking = [
 {name:'PlayerXYZ',points:128450,hours:'87h',level:38,avatar:'PX'},
 {name:'ShadowHunter',points:112800,hours:'79h',level:35,avatar:'SH'},
 {name:'LunaMage',points:98650,hours:'72h',level:31,avatar:'LM'},
 {name:'DarkKnight',points:87400,hours:'64h',level:28,avatar:'DK'},
 {name:'HealerQueen',points:76500,hours:'58h',level:26,avatar:'HQ'},
 {name:'Ragnar',points:62300,hours:'49h',level:23,avatar:'RG'},
 {name:'ArcaneSoul',points:54200,hours:'42h',level:21,avatar:'AS'},
 {name:'Você',points:12450,hours:'6h 42min',level:12,avatar:'WL'},
];
