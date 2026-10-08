import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/features/club/home';
import { clubHead } from '@/features/club/metadata';
export const Route = createFileRoute('/')({
 head: () => clubHead('Seu tempo vale recompensa', 'Assista, acumule Points e descubra o seu próximo drop no WeLoveMMO Club. MVP demonstrativo.'),
 component: HomePage,
});
