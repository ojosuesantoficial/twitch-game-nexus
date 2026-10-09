import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/features/club/pages';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/perfil')({
 head: () => clubHead('Acessar o Club', 'Explore seu perfil demo e o acesso preparado para Google e Twitch.'),
 component: ProfilePage,
});
