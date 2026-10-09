import { createFileRoute } from '@tanstack/react-router';
import { JourneyPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/jornada')({
 head: () => clubHead('Minha Jornada', 'Seu progresso de Player a WeLoveMMO Master, com níveis e conquistas.'),
 component: JourneyPage,
});
