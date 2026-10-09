import { createFileRoute } from '@tanstack/react-router';
import { HowPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/como-funciona')({
 head: () => clubHead('Como Funciona', 'Do play ao drop: conheça a jornada, as regras e os limites do MVP.'),
 component: HowPage,
});
