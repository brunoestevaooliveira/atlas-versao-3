
'use client';

import { useState } from 'react';
import InteractiveMap from '@/components/interactive-map';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layers, Search, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { issues as initialIssues } from '@/lib/data';

export default function Home() {
  const [issues, setIssues] = useState(initialIssues);
  const [upvotedIssues, setUpvotedIssues] = useState(new Set<string>());

  const getStatusVariant = (status: 'Recebido' | 'Em análise' | 'Resolvido') => {
    switch (status) {
      case 'Resolvido':
        return 'default';
      case 'Em análise':
        return 'secondary';
      case 'Recebido':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleUpvote = (issueId: string) => {
    if (upvotedIssues.has(issueId)) {
      return; // Already upvoted
    }

    setIssues(prevIssues =>
      prevIssues.map(issue =>
        issue.id === issueId ? { ...issue, upvotes: issue.upvotes + 1 } : issue
      )
    );
    setUpvotedIssues(prevUpvoted => new Set(prevUpvoted).add(issueId));
  };


  return (
    <div className="relative h-screen w-screen">
      <InteractiveMap />
      
      <div className="absolute top-24 left-4 z-10 w-80 space-y-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200">
           <CardHeader>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por endereço..." className="pl-10 bg-white" />
              </div>
           </CardHeader>
           <CardContent>
             <div className="flex items-center space-x-2">
                <Switch id="layers-switch" />
                <Label htmlFor="layers-switch">Mostrar Ocorrências</Label>
              </div>
           </CardContent>
        </Card>
      </div>

       <div className="absolute bottom-4 right-4 z-10 space-y-2">
           <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200 p-2 rounded-lg">
                <Button variant="ghost" size="icon">
                    <Layers />
                </Button>
            </Card>
       </div>
       
       <div className="absolute top-24 right-4 z-10 w-96 space-y-4">
         <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-gray-200 max-h-[calc(100vh-13rem)]">
            <CardHeader>
              <CardTitle>Ocorrências Recentes</CardTitle>
              <CardDescription>Veja os problemas reportados pela comunidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-full max-h-[calc(100vh-20rem)]">
                <div className="space-y-4 pr-4">
                  {issues.map((issue) => (
                    <div key={issue.id} className="p-3 rounded-lg bg-white/50 border border-gray-200/80">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm mb-1">{issue.title}</h4>
                        <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{issue.category}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleUpvote(issue.id)}
                        disabled={upvotedIssues.has(issue.id)}
                      >
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Apoiar ({issue.upvotes})
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
         </Card>
       </div>
    </div>
  );
}
