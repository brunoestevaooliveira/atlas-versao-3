
import type { Issue } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, ThumbsUp, MapPin } from 'lucide-react';
import { Button } from './ui/button';

interface IssueCardProps {
  issue: Issue;
  onUpvote: (id: string, currentUpvotes: number) => void;
  isUpvoted: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onUpvote, isUpvoted }) => {
  const getStatusVariant = (status: Issue['status']) => {
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

  return (
    <Card className="flex flex-col h-full bg-card/50 border-border hover:border-primary/50 transition-colors duration-300">
      <CardHeader>
        <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden">
          <Image src={issue.imageUrl} alt={issue.title} layout="fill" objectFit="cover" data-ai-hint="urban problem" />
        </div>
        <div className='flex justify-between items-start'>
            <div>
                 <Badge variant="secondary">{issue.category}</Badge>
            </div>
            <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
        </div>
        <CardTitle className="pt-2 text-xl">{issue.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{issue.description}</CardDescription>
         {issue.address && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4"/>
                <span>{issue.address}</span>
            </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex-col items-start gap-4">
        <div className="w-full">
            <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onUpvote(issue.id, issue.upvotes)}
                disabled={isUpvoted}
            >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Apoiar ({issue.upvotes})
            </Button>
        </div>
        <div className="w-full flex justify-between">
            <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{issue.reporter}</span>
            </div>
            <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(issue.reportedAt, 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueCard;
