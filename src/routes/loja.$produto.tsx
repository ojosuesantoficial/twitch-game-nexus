import { createFileRoute } from '@tanstack/react-router';
import { ProductPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
import { initialProducts } from '@/features/club/data';
export const Route = createFileRoute('/loja/$produto')({
 head: ({params}) => { const product=initialProducts.find(p=>p.id===params.produto); return clubHead(product?.name ?? 'Detalhe do Drop', product?.description ?? 'Confira seu próximo drop demonstrativo no WeLoveMMO Club.'); },
 component: ProductRoute,
});
function ProductRoute() { const {produto}=Route.useParams(); return <ProductPage key={produto} id={produto}/>; }
