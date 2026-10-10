import { createFileRoute } from '@tanstack/react-router';
import { ProductPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
import { productContent } from '@/features/club/data';
export const Route = createFileRoute('/loja/$produto')({
 head: ({params}) => { const c=productContent[params.produto]; return clubHead(c?`Resgate ${params.produto.replace('pix-','PIX R$')}`:'Detalhe do Drop', c?.description ?? 'Resgate sua recompensa PIX no WeLoveMMO Club.'); },
 component: ProductRoute,
});
function ProductRoute() { const {produto}=Route.useParams(); return <ProductPage key={produto} id={produto}/>; }
