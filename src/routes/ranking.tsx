import { createFileRoute } from '@tanstack/react-router';
import { RankingPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/ranking')({
 head: () => clubHead('Ranking de Players', 'Conheça as lendas do Club no ranking demonstrativo de Points e horas.'),
 component: RankingPage,
});
