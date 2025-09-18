/**
 * @file src/app/report/page.tsx
 * @fileoverview Página para reportar uma nova ocorrência.
 * Este componente atua como um container para o formulário de relatório,
 * envolvendo-o com um layout de card para apresentação visual e fornecendo
 * o título e a descrição da página. A lógica do formulário em si está no
 * componente `ReportForm`.
 */

'use client';

import ReportForm from '@/components/report-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

/**
 * Componente da página de relatório.
 */
export default function ReportPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="container mx-auto py-8 pt-24 max-w-4xl space-y-6">
        <Card className="shadow-lg bg-card/80">
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
            {/* O componente do formulário em si, contendo toda a lógica de preenchimento e submissão. */}
            <ReportForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
