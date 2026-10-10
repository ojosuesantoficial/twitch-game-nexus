// IMAGENS DAS RECOMPENSAS: para trocar uma imagem, substitua o arquivo
// referenciado abaixo (ou aponte para outro arquivo) mantendo o mesmo id do produto.
// Preços, estoque e status vêm do backend (tabela products), não deste arquivo.
import pix30 from '@/assets/products/pix-30.jpg.asset.json';
import pix80 from '@/assets/products/pix-80.jpg.asset.json';
import pix100 from '@/assets/products/pix-100.jpg.asset.json';

export const productContent: Record<string, { image: string; description: string; featured?: boolean }> = {
 'pix-30': { image: pix30.url, featured: true, description: 'Participe do sorteio de um PIX de R$30. Pagamento revisado e enviado manualmente pela equipe WeLoveMMO.' },
 'pix-80': { image: pix80.url, description: 'Resgate um PIX de R$80. Pagamento revisado e enviado manualmente pela equipe WeLoveMMO.' },
 'pix-100': { image: pix100.url, description: 'Resgate um PIX de R$100. Pagamento revisado e enviado manualmente pela equipe WeLoveMMO.' },
};
