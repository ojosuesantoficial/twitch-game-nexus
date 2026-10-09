import { createFileRoute } from '@tanstack/react-router';
import { PlayersPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/players')({
 head: () => clubHead('Players do Club', 'Encontre sua party e conheça os players da comunidade WeLoveMMO.'),
 component: PlayersPage,
});
