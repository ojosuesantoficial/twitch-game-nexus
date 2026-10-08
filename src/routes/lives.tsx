import { createFileRoute } from '@tanstack/react-router';
import { LivesPage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/lives')({
 head: () => clubHead('Lives WeLoveMMO', 'Encontre as lives do Club e acompanhe o estado da futura integração Twitch.'),
 component: LivesPage,
});
