import type { Issue } from './types';

// This file is now a backup and will not be actively used.
// Data will be fetched from Firestore.

export const issues: Issue[] = [
  {
    id: '1',
    title: 'Poste de luz queimado na Quadra 15',
    description: 'O poste em frente ao lote 23 está com a lâmpada queimada há mais de uma semana, deixando a rua muito escura e perigosa à noite.',
    category: 'Iluminação Pública',
    status: 'Resolvido',
    location: { lat: -16.001, lng: -47.985 },
    imageUrl: 'https://placehold.co/600x400.png',
    reportedAt: new Date('2024-05-10T09:00:00Z'),
    reporter: 'Maria Silva',
    upvotes: 15,
  },
  {
    id: '2',
    title: 'Buraco perigoso na avenida principal',
    description: 'Existe um buraco grande e fundo no meio da Avenida Central, próximo ao cruzamento com a Rua 5. Vários carros já quase caíram nele.',
    category: 'Buracos na Via',
    status: 'Em análise',
    location: { lat: -16.004, lng: -47.988 },
    imageUrl: 'https://placehold.co/600x400.png',
    reportedAt: new Date('2024-05-20T14:30:00Z'),
    reporter: 'João Pereira',
    upvotes: 32,
  },
];
