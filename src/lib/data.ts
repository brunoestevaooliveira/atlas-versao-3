import type { Issue } from './types';

// This file is now a backup and will not be actively used.
// Data will be fetched from Firestore.

export const issues: Omit<Issue, 'id' | 'reportedAt'>[] = [
  {
    title: 'Poste de luz queimado na Quadra 15',
    description: 'O poste em frente ao lote 23 está com a lâmpada queimada há mais de uma semana, deixando a rua muito escura e perigosa à noite.',
    category: 'Iluminação pública',
    status: 'Resolvido',
    location: { lat: -16.001, lng: -47.985 },
    imageUrl: 'https://placehold.co/600x400.png?text=Poste+Queimado',
    reporter: 'Maria Silva',
    upvotes: 15,
  },
  {
    title: 'Buraco perigoso na avenida principal',
    description: 'Existe um buraco grande e fundo no meio da Avenida Central, próximo ao cruzamento com a Rua 5. Vários carros já quase caíram nele.',
    category: 'Buracos na via',
    status: 'Em análise',
    location: { lat: -16.004, lng: -47.988 },
    imageUrl: 'https://placehold.co/600x400.png?text=Buraco+na+Via',
    reporter: 'João Pereira',
    upvotes: 32,
  },
  {
    title: 'Lixo acumulado na praça central',
    description: 'As lixeiras da praça central estão transbordando e o lixo está se espalhando pela calçada. O cheiro está muito forte.',
    category: 'Lixo acumulado',
    status: 'Recebido',
    location: { lat: -16.005, lng: -47.986 },
    imageUrl: 'https://placehold.co/600x400.png?text=Lixo+Acumulado',
    reporter: 'Ana Costa',
    upvotes: 21,
  },
  {
    title: 'Sinal de trânsito com defeito',
    description: 'O semáforo do cruzamento da Rua 10 com a Avenida Brasil está piscando amarelo sem parar há dois dias, causando confusão no trânsito.',
    category: 'Sinalização danificada',
    status: 'Em análise',
    location: { lat: -16.002, lng: -47.991 },
    imageUrl: 'https://placehold.co/600x400.png?text=Sinal+Defeituoso',
    reporter: 'Carlos Souza',
    upvotes: 8,
  },
  {
    title: 'Vazamento de água limpa',
    description: 'Há um vazamento de água potável na calçada da Quadra 2, que está desperdiçando muita água e já formou uma poça grande.',
    category: 'Vazamento de água',
    status: 'Resolvido',
    location: { lat: -15.999, lng: -47.989 },
    imageUrl: 'https://placehold.co/600x400.png?text=Vazamento',
    reporter: 'Fernanda Lima',
    upvotes: 45,
  },
];
