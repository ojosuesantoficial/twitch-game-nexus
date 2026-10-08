import { createFileRoute } from '@tanstack/react-router';
import { StorePage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/loja')({
 head: () => clubHead('Loja WeLoveMMO Club', 'Explore drops e recompensas demonstrativas para o seu próximo upgrade.'),
 component: StorePage,
});
