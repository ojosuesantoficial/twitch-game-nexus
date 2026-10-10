import { createFileRoute } from '@tanstack/react-router';
import { ProductPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
import { productContent } from '@/features/club/data';
export const Route = createFileRoute('/loja/$produto')({
 head: ({params}) => clubHead('Recompensa PIX', productContent[params.produto]?.description ?? 'Confira esta recompensa no WeLoveMMO Club.'),
 component: ProductRoute,
});
function ProductRoute() { const {produto}=Route.useParams(); return <ProductPage key={produto} id={produto}/>; }
