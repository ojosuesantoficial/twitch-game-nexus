import { createFileRoute } from '@tanstack/react-router';
import { AdminPage } from '@/features/club/admin';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/admin')({
 head: () => clubHead('Administração demonstrativa', 'Gerencie o catálogo, ajustes e auditoria de Points na demonstração do Club.'),
 component: AdminPage,
});
