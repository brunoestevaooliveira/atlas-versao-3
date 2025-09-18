/**
 * @file src/app/login/page.tsx
 * @fileoverview Componente da página de login.
 * Este arquivo renderiza o formulário de login, permitindo que os usuários
 * acessem a plataforma com email/senha ou através do login com Google.
 * Ele utiliza o `useAuth` para interagir com o contexto de autenticação.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';


/**
 * Componente do ícone do Google para o botão de login social.
 */
const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.02,35.625,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

/**
 * Componente principal da página de Login.
 */
export default function LoginPage() {
  // Estados para controlar os campos do formulário.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Obtém as funções de autenticação do contexto.
  const { login, loginWithGoogle } = useAuth();
  // Estados para controlar o loading dos botões.
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Hook para exibir notificações (toasts).
  const { toast } = useToast();

  /**
   * Manipula a submissão do formulário de login com email e senha.
   * @param {React.FormEvent} e O evento do formulário.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chama a função de login do contexto.
      await login(email, password);
      toast({
        title: 'Login bem-sucedido!',
        description: 'Bem-vindo de volta.',
      });
      // O redirecionamento é tratado pelo AuthProvider/Layout.
    } catch (error: any) {
      // Exibe uma notificação de erro em caso de falha.
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: error.message || 'Usuário ou senha incorretos.',
      });
    } finally {
        setLoading(false);
    }
  };

  /**
   * Manipula o clique no botão de login com Google.
   */
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
        // Chama a função de login com Google do contexto.
        await loginWithGoogle();
        toast({
            title: 'Login com Google bem-sucedido!',
            description: 'Bem-vindo(a).',
        });
    } catch (error: any) {
        // O erro já é tratado e exibido pelo toast dentro do AuthContext,
        // mas o bloco try/catch aqui garante que o loading seja finalizado.
    } finally {
        setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo ao Atlas Cívico</CardTitle>
          <CardDescription>Faça login para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2" />}
              Entrar
            </Button>
          </form>
          <Separator className="my-6" />
           <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={googleLoading}>
               {googleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
               Entrar com Google
            </Button>
        </CardContent>
         <CardFooter className="justify-center text-sm">
          <p>Não tem uma conta? <Link href="/register" className="font-semibold text-primary hover:underline">Registre-se</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
