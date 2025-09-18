/**
 * @file src/context/auth-context.tsx
 * @fileoverview Provedor de Contexto para Autenticação.
 * Este arquivo gerencia o estado global de autenticação do usuário, interage com o Firebase Auth
 * e Firestore para obter dados do usuário, e fornece funções de login, logout e registro
 * para toda a aplicação. Também controla a lógica para exibir o tutorial para novos usuários.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppUser, AppUserData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Chave para o localStorage que marca se o tutorial já foi concluído.
const TUTORIAL_COMPLETED_KEY = 'tutorialCompleted';

/**
 * Interface que define a estrutura do contexto de autenticação.
 */
interface AuthContextType {
  /** O objeto de usuário do Firebase Auth, ou null se não estiver logado. */
  authUser: User | null;
  /** O objeto de usuário personalizado da aplicação (do Firestore), ou null. */
  appUser: AppUser | null;
  /** `true` enquanto o estado de autenticação inicial está sendo verificado. */
  isLoading: boolean;
  /** `true` se o usuário logado tem permissões de administrador. */
  isAdmin: boolean;
  /** `true` se o modal de tutorial deve ser exibido. */
  showTutorial: boolean;
  /** Função para controlar a visibilidade do modal de tutorial. */
  setShowTutorial: (show: boolean) => void;
  /** Função para registrar um novo usuário com email, senha e nome. */
  register: (email: string, pass: string, name: string) => Promise<void>;
  /** Função para fazer login com email e senha. */
  login: (email: string, pass: string) => Promise<void>;
  /** Função para fazer login usando o pop-up do Google. */
  loginWithGoogle: () => Promise<void>;
  /** Função para fazer logout do usuário. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Busca os dados do perfil do usuário no Firestore.
 * @param {string} uid O ID do usuário.
 * @returns {Promise<AppUser | null>} O objeto AppUser ou null se não for encontrado.
 */
const fetchAppUser = async (uid: string): Promise<AppUser | null> => {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        const data = docSnap.data() as AppUserData;
        
        return {
            ...data,
            // Converte o Timestamp do Firestore para um objeto Date.
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            issuesReported: data.issuesReported || 0, // Garante que o campo exista
        };
    }
    return null;
}

/**
 * Componente Provedor que envolve a aplicação e fornece o contexto de autenticação.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  // Efeito principal que ouve as mudanças no estado de autenticação do Firebase.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setAuthUser(user);
        
        // Verifica se é um usuário novo comparando o tempo de criação com o último login.
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

        // Verifica se o tutorial já foi concluído no localStorage.
        const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);

        // Mostra o tutorial apenas se for um usuário novo E ele ainda não viu o tutorial.
        if (isNewUser && tutorialCompleted !== 'true') {
            setShowTutorial(true);
        }

        // Busca o perfil do usuário no Firestore para obter o 'role'.
        const appProfile = await fetchAppUser(user.uid);
        
        if (appProfile) {
            setAppUser(appProfile);
            // Define o status de admin com base no campo 'role' do documento do Firestore.
            setIsAdmin(appProfile.role === 'admin');
        } else {
            // Se o perfil não existe, cria um novo.
            await handleNewUser(user);
            // Novos usuários não são admins por padrão.
            setIsAdmin(false);
        }

      } else {
        // Se não houver usuário, limpa todos os estados relacionados.
        setAuthUser(null);
        setAppUser(null);
        setIsAdmin(false);
        setShowTutorial(false); // Reseta ao fazer logout.
      }
      setIsLoading(false);
    });

    // Função de limpeza que cancela a inscrição do listener ao desmontar o componente.
    return () => unsubscribe();
  }, []);

  /**
   * Cria um novo documento de usuário no Firestore.
   * Chamado no registro ou no primeiro login com um provedor social.
   * @param {User} user O objeto de usuário do Firebase Auth.
   * @param {string | null} [name] O nome do usuário (opcional, usado no registro por email).
   */
  const handleNewUser = async (user: User, name?: string | null) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    // Se o documento já existe, apenas atualiza o estado local.
    if (docSnap.exists()) { 
        const appProfile = await fetchAppUser(user.uid);
        if (appProfile) {
          setAppUser(appProfile);
          setIsAdmin(appProfile.role === 'admin');
        }
        return;
    }
    
    // Define o nome do novo usuário.
    const newName = name || user.displayName || user.email?.split('@')[0] || 'Usuário';
    
    const newUserDocData: AppUserData = {
        uid: user.uid,
        email: user.email,
        name: newName,
        photoURL: user.photoURL,
        role: 'user', // Papel padrão para novos usuários.
        createdAt: serverTimestamp() as Timestamp,
        issuesReported: 0, // Inicia a contagem de ocorrências
    };
    
    await setDoc(userRef, newUserDocData);

    // Atualiza o estado local com os dados do novo usuário para evitar uma nova leitura.
    const newAppUser: AppUser = {
        uid: newUserDocData.uid,
        email: newUserDocData.email,
        name: newUserDocData.name,
        photoURL: newUserDocData.photoURL,
        role: newUserDocData.role,
        createdAt: new Date(), // Valor aproximado, o valor real está no servidor.
        issuesReported: newUserDocData.issuesReported,
    };
    setAppUser(newAppUser);
  }

  /**
   * Registra um novo usuário com email, senha e nome.
   */
  const register = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await handleNewUser(userCredential.user, name);
    // O listener onAuthStateChanged cuidará de exibir o tutorial.
  };

  /**
   * Autentica um usuário com email e senha.
   */
  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  /**
   * Autentica um usuário com o provedor do Google.
   */
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error: any) {
        // Tratamento de erros comuns do login com Google.
        let description = error.message || 'Não foi possível autenticar com o Google.';
        if (error.code === 'auth/unauthorized-domain') {
            description = 'Este domínio não está autorizado para login. Por favor, adicione-o no Console do Firebase > Authentication > Settings > Authorized domains.';
        } else if (error.code === 'auth/popup-closed-by-user') {
            return; // Não mostra erro se o usuário simplesmente fechar o pop-up.
        }
        
        console.error("Erro no Login com Google:", error);
        toast({
            variant: 'destructive',
            title: 'Falha no Login com Google',
            description: description,
        });
        throw error;
    }
  };

  /**
   * Desconecta o usuário atual e o redireciona para a página de login.
   */
  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // Fornece os valores de estado e as funções para os componentes filhos.
  return (
    <AuthContext.Provider value={{ authUser, appUser, isLoading, isAdmin, showTutorial, setShowTutorial, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook customizado para acessar o contexto de autenticação.
 * @returns {AuthContextType} O objeto do contexto de autenticação.
 * @throws {Error} Se for usado fora de um `AuthProvider`.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
