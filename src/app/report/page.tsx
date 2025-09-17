
'use client';

import ReportForm from '@/components/report-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import InteractiveMap from '@/components/interactive-map';

export default function ReportPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <InteractiveMap issues={[]} />
      </div>
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative container mx-auto py-8 pt-24 max-w-4xl space-y-6">
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
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
      </div>
    </div>
  );
}

    