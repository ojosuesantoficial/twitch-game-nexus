import { createFileRoute } from '@tanstack/react-router';
import { DropsPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/drops')({
 head: () => clubHead('Meus Drops', 'Acompanhe seu saldo WMMO, metas, resgates e histórico demonstrativo.'),
 component: DropsPage,
});
