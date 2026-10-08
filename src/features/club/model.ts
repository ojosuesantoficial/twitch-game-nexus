export interface User { id: string; displayName: string; level: number; demo: boolean }
export interface PointsWallet { userId: string; balance: number; earned: number; spent: number }
export interface PointTransaction { id: string; userId: string; amount: number; reason: string; date: string; idempotencyKey: string; actor: string }
export interface WatchSession { id: string; userId: string; streamId: string; minutes: number; source: 'demo' | 'verified-twitch'; verified: boolean }
export interface Product { id: string; name: string; description: string; category: string; price: number; stock: number; featured: boolean; active: boolean; image: string }
export interface Redemption { id: string; productId: string; productName: string; cost: number; date: string; status: 'demo-confirmed' }
export interface Stream { id: string; title: string; game: string; viewers: number; status: 'demo-online' | 'offline' }
export interface ClubEvent { id: string; name: string; bonus: number; status: 'upcoming' | 'demo-active' }
export interface RewardsState { wallet: PointsWallet; transactions: PointTransaction[]; sessions: WatchSession[]; redemptions: Redemption[]; products: Product[] }
export const points = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
export const categories = ['Mouses', 'Teclados', 'Headsets', 'Monitores', 'Placas de vídeo', 'Processadores', 'Memórias', 'SSDs', 'Periféricos', 'Hardware', 'Produtos WeLoveMMO', 'Recompensas especiais'];
