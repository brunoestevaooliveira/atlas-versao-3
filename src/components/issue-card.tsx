
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
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: Issue;
  onUpvote: (id: string, currentUpvotes: number) => void;
  isUpvoted: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onUpvote, isUpvoted }) => {
  const getStatusVariant = (status: Issue['status']): "success" | "warning" | "info" | "default" => {
    switch (status) {
      case 'Resolvido':
        return 'success';
      case 'Em análise':
        return 'warning';
      case 'Recebido':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
     <Dialog>
      <Card className={cn(
        "flex flex-col h-full bg-secondary/50 border border-white/5 shadow-md",
        "transition-all duration-300 hover:bg-muted/80 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
        )}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg text-foreground">{issue.title}</CardTitle>
              <Badge variant={getStatusVariant(issue.status)} className="flex-shrink-0">{issue.status}</Badge>
          </div>
          <CardDescription className="text-sm !mt-1 text-primary font-semibold">{issue.category}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
              {issue.description}
            </p>
            {issue.address && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-primary"/>
                  <span className="text-muted-foreground">{issue.address}</span>
              </div>
            )}
        </CardContent>
        <Separator className="my-0 bg-border/50" />
        <CardFooter className="flex-col items-stretch p-0">
           <div className="flex items-center">
              <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full rounded-t-none rounded-br-none text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-all duration-200 hover:-translate-y-px",
                    isUpvoted && "text-primary bg-primary/10"
                    )}
                  onClick={() => onUpvote(issue.id, issue.upvotes)}
                  disabled={isUpvoted}
              >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Apoiar ({issue.upvotes})
              </Button>
              <Separator orientation="vertical" className="h-10 bg-border/50" />
              <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full rounded-t-none rounded-bl-none text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Comentar ({issue.comments?.length ?? 0})
                  </Button>
              </DialogTrigger>
           </div>
           <Separator className="bg-border/50"/>
           <div className="text-xs text-slate-500 flex justify-between p-3 bg-background/50 rounded-b-lg">
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
