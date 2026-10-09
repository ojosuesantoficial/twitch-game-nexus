import mouse from '@/assets/products/mouse.jpg';
import keyboard from '@/assets/products/keyboard.jpg';
import headset from '@/assets/products/headset.jpg';
import ssd from '@/assets/products/ssd.jpg';
import gpu from '@/assets/products/gpu.jpg';
import monitor from '@/assets/products/monitor.jpg';
import type { Product, RewardsState, Stream, ClubEvent } from './model';
export const initialProducts: Product[] = [
 { id:'mouse', name:'Mouse Gamer SteelSeries', category:'Mouses', price:20000, stock:10, featured:true, active:true, image:mouse, description:'Precisão em cada movimento. Um upgrade para as suas próximas conquistas. Produto ilustrativo da demonstração; modelo e disponibilidade serão confirmados na loja real.' },
 { id:'keyboard', name:'Teclado Mecânico RGB', category:'Teclados', price:30000, stock:8, featured:false, active:true, image:keyboard, description:'Cada comando faz a diferença. Teclado mecânico com iluminação RGB. Imagem e especificações ilustrativas.' },
 { id:'headset', name:'Headset Gamer Pro', category:'Headsets', price:25000, stock:6, featured:false, active:true, image:headset, description:'Ouça cada detalhe da sua próxima aventura. Headset gamer ilustrativo, sem estoque físico confirmado.' },
 { id:'ssd', name:'SSD NVMe 1 TB', category:'SSDs', price:40000, stock:5, featured:false, active:true, image:ssd, description:'Menos espera, mais jogo. SSD NVMe ilustrativo para demonstrar a jornada de recompensas.' },
 { id:'gpu', name:'Placa de Vídeo RTX', category:'Placas de vídeo', price:150000, stock:2, featured:false, active:true, image:gpu, description:'Sua próxima grande conquista. Placa de vídeo ilustrativa; modelo final ainda não definido.' },
 { id:'monitor', name:'Monitor Gamer 27”', category:'Monitores', price:65000, stock:4, featured:false, active:true, image:monitor, description:'Um novo horizonte para o seu setup. Monitor ilustrativo de 27 polegadas.' },
 { id:'special', name:'Drop Especial do Club', category:'Recompensas especiais', price:5000, stock:20, featured:false, active:true, image:mouse, description:'Recompensa de demonstração para experimentar um resgate com seu saldo atual. Não gera entrega, pedido ou prêmio real.' },
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
