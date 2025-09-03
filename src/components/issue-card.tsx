
import type { Issue } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, User, ThumbsUp, MapPin, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import CommentSection from './comment-section';
import { Separator } from './ui/separator';

interface IssueCardProps {
  issue: Issue;
  onUpvote: (id: string, currentUpvotes: number) => void;
  isUpvoted: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onUpvote, isUpvoted }) => {
  const getStatusVariant = (status: Issue['status']): "success" | "warning" | "info" => {
    switch (status) {
      case 'Resolvido':
        return 'success';
      case 'Em análise':
        return 'warning';
      case 'Recebido':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
     <Dialog>
      <Card className="flex flex-col h-full bg-secondary hover:border-primary/50 transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg font-bold">{issue.title}</CardTitle>
              <Badge variant={getStatusVariant(issue.status)} className="flex-shrink-0">{issue.status}</Badge>
          </div>
          <CardDescription className="text-sm !mt-1 text-brand">{issue.category}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {issue.description}
            </p>
            {issue.address && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-brand"/>
                  <span>{issue.address}</span>
              </div>
            )}
        </CardContent>
        <Separator className="my-0" />
        <CardFooter className="flex-col items-stretch p-0">
           <div className="flex items-center">
              <Button 
                  variant="ghost" 
                  className="w-full rounded-t-none rounded-br-none"
                  onClick={() => onUpvote(issue.id, issue.upvotes)}
                  disabled={isUpvoted}
              >
                  <ThumbsUp className="mr-2 h-4 w-4 text-brand" />
                  Apoiar ({issue.upvotes})
              </Button>
              <Separator orientation="vertical" className="h-10" />
              <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full rounded-t-none rounded-bl-none">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Comentar ({issue.comments?.length ?? 0})
                  </Button>
              </DialogTrigger>
           </div>
           <Separator />
           <div className="text-xs text-muted-foreground flex justify-between p-3 bg-background/50 rounded-b-lg">
                <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    <span>{issue.reporter}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{format(issue.reportedAt, 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
            </div>
        </CardFooter>
      </Card>
      <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{issue.title}</DialogTitle>
          </DialogHeader>
          <CommentSection issueId={issue.id} comments={issue.comments} />
      </DialogContent>
    </Dialog>
  );
};

export default IssueCard;
