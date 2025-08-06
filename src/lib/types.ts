export type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Recebido' | 'Em análise' | 'Resolvido';
  location: { lat: number; lng: number };
  imageUrl: string;
  reportedAt: Date;
  reporter: string;
};
