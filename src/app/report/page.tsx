
'use client';

import ReportForm from '@/components/report-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Database } from 'lucide-react';
import { issues as seedData } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, addDoc, GeoPoint, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';


export default function ReportPage() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    toast({
      title: 'Iniciando semeadura...',
      description: 'Adicionando ocorrências de teste ao banco de dados.',
    });
    try {
      let count = 0;
      for (const issue of seedData) {
        // Create a payload that matches the IssueData type
        const payload = {
          ...issue,
          location: new GeoPoint(issue.location.lat, issue.location.lng),
          reportedAt: Timestamp.fromDate(new Date()), // Use current date for seed data
          imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(issue.title)}`,
        };
        await addDoc(collection(db, 'issues'), payload);
        count++;
      }
      toast({
        title: 'Banco de dados semeado!',
        description: `${count} ocorrências de teste foram adicionadas com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao semear o banco de dados:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na semeadura',
        description: 'Não foi possível adicionar os dados de teste. Verifique o console.',
      });
    } finally {
      setIsSeeding(false);
    }
  };


  return (
    <div className="container mx-auto py-8 mt-20 max-w-4xl space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-headline">Reportar uma Ocorrência</CardTitle>
          <CardDescription>
            Ajude a melhorar nossa cidade. Descreva o problema e sua localização para que possamos encaminhá-lo para a equipe responsável.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportForm />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Dados de Teste</CardTitle>
          <CardDescription>
            Use o botão abaixo para popular o banco de dados com ocorrências de exemplo para fins de teste. Isso adicionará 10 problemas fictícios ao mapa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSeedDatabase} disabled={isSeeding}>
            <Database className="mr-2 h-4 w-4" />
            {isSeeding ? 'Semeando...' : 'Semear Banco de Dados'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
