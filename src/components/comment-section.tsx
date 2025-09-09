
'use client';

import { useState } from 'react';
import type { Comment } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { addCommentToIssue, deleteCommentFromIssue } from '@/services/issue-service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';
import { Send, ShieldCheck, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommentSectionProps {
  issueId: string;
  comments: Comment[];
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}


const CommentSection: React.FC<CommentSectionProps> = ({ issueId, comments }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { appUser, isAdmin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

     if (!appUser) {
        toast({
            variant: 'destructive',
            title: 'Acesso Negado',
            description: 'Você precisa estar logado para comentar.',
        });
        return router.push('/login');
    }

    setLoading(true);
    try {
      // Passa o objeto `appUser` completo, que contém o `role`
      await addCommentToIssue(issueId, { content: newComment }, appUser);
      setNewComment('');
      toast({
        title: 'Comentário Adicionado!',
        description: 'Sua mensagem foi publicada.',
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Comentar',
        description: 'Não foi possível adicionar seu comentário.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
        await deleteCommentFromIssue(issueId, commentId);
        toast({
            title: 'Comentário Removido',
            description: 'O comentário foi excluído com sucesso.'
        });
    } catch (error) {
        console.error("Erro ao remover comentário:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Excluir',
            description: 'Não foi possível remover o comentário.'
        });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Adicione seu comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          disabled={loading || !appUser}
        />
        <Button type="submit" disabled={loading || !newComment.trim() || !appUser}>
          <Send className="mr-2 h-4 w-4" />
          {loading ? 'Enviando...' : 'Enviar Comentário'}
        </Button>
      </form>
      
      <Separator />

      <ScrollArea className="h-72 pr-4">
        <div className="space-y-6">
          <h4 className="text-lg font-semibold">Comentários</h4>
          {comments && comments.length > 0 ? (
            comments.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.authorPhotoURL || undefined} alt={comment.author} />
                    <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{comment.author}</span>
                    {comment.authorRole === 'admin' && (
                        <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Administrador
                        </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      • {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                </div>
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4 text-destructive/70"/>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Comentário?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O comentário será removido permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CommentSection;
