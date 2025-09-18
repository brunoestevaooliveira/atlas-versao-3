/**
 * @file src/services/issue-service.ts
 * @fileoverview Este arquivo contém toda a lógica para interagir com a coleção 'issues' no Firestore.
 * Inclui funções para criar, ler, atualizar e excluir ocorrências, bem como
 * para adicionar e excluir comentários.
 */

'use client';

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  GeoPoint,
  serverTimestamp,
  getDocs,
  arrayUnion,
  getDoc,
} from 'firebase/firestore';
import type { Issue, IssueData, CommentData, AppUser, Comment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';


/**
 * Converte um documento do Firestore (IssueData) para um objeto do tipo Issue, 
 * que é mais fácil de usar no frontend (ex: convertendo Timestamps para objetos Date).
 * @param {any} docData Os dados do documento do Firestore.
 * @param {string} id O ID do documento.
 * @returns {Issue} O objeto de ocorrência formatado.
 */
const fromFirestore = (docData: any, id: string): Issue => {
  const data = docData as IssueData;
  return {
    id,
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    location: {
      lat: data.location.latitude,
      lng: data.location.longitude,
    },
    address: data.address,
    imageUrl: data.imageUrl,
    reportedAt: data.reportedAt ? (data.reportedAt as Timestamp).toDate() : new Date(),
    reporter: data.reporter,
    reporterId: data.reporterId,
    upvotes: data.upvotes,
    // Converte os Timestamps dos comentários para Datas e os ordena do mais recente para o mais antigo.
    comments: (data.comments || []).map(comment => ({
      ...comment,
      createdAt: (comment.createdAt as Timestamp).toDate(),
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  };
};

/**
 * Tipo para os dados de uma nova ocorrência sendo criada.
 */
export type NewIssue = {
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number };
  address: string;
  reporter: string;
  reporterId: string;
};

/**
 * Adiciona uma nova ocorrência ao Firestore.
 * Esta função é chamada a partir do lado do cliente.
 * @param {NewIssue} issue O objeto da nova ocorrência.
 * @returns {Promise<string>} O ID do documento recém-criado.
 * @throws {Error} Se algum campo obrigatório estiver faltando ou for inválido.
 */
export async function addIssueClient(issue: NewIssue) {
  // Validação dos dados de entrada.
  if (!issue.title?.trim()) throw new Error("Título obrigatório");
  if (!issue.description?.trim()) throw new Error("Descrição obrigatória");
  if (!issue.address?.trim()) throw new Error("Endereço obrigatório");
  if (!issue.reporterId) throw new Error("ID do relator é obrigatório");
  if (
    typeof issue.location?.lat !== "number" ||
    typeof issue.location?.lng !== "number" ||
    Number.isNaN(issue.location.lat) ||
    Number.isNaN(issue.location.lng)
  ) {
    throw new Error("Localização inválida");
  }

  const ref = collection(db, "issues");
  // Cria o payload para o Firestore, convertendo a localização para GeoPoint e usando serverTimestamp.
  const payload: Omit<IssueData, 'reportedAt'> & { reportedAt: any } = {
    title: issue.title.trim(),
    description: issue.description.trim(),
    category: issue.category || "Outros",
    status: "Recebido", // Status inicial padrão.
    upvotes: 0,
    reporter: issue.reporter,
    reporterId: issue.reporterId,
    address: issue.address.trim(),
    imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(issue.title)}`, // Imagem de placeholder.
    reportedAt: serverTimestamp(), // Usa o timestamp do servidor para consistência.
    location: new GeoPoint(issue.location.lat, issue.location.lng),
    comments: [], // Inicializa com um array de comentários vazio.
  };

  const docRef = await addDoc(ref, payload);
  return docRef.id;
}

/**
 * Busca todas as ocorrências do Firestore uma única vez.
 * @returns {Promise<Issue[]>} Uma lista de todas as ocorrências.
 */
export const getIssues = async (): Promise<Issue[]> => {
  const q = query(collection(db, 'issues'), orderBy('reportedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => fromFirestore(doc.data() as IssueData, doc.id));
};

/**
 * Inscreve-se para ouvir atualizações em tempo real da coleção de ocorrências.
 * @param {(issues: Issue[]) => void} callback A função a ser chamada com a lista de ocorrências sempre que houver uma atualização.
 * @returns {() => void} Uma função para cancelar a inscrição (unsubscribe).
 */
export const listenToIssues = (callback: (issues: Issue[]) => void): (() => void) => {
  const q = query(collection(db, 'issues'), orderBy('reportedAt', 'desc'));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const issues = querySnapshot.docs.map(doc => fromFirestore(doc.data(), doc.id));
    callback(issues);
  }, (error) => {
    console.error("Erro no listener do Firestore:", error);
    // Opcionalmente, informar o usuário que as atualizações em tempo real falharam.
  });
  return unsubscribe; // Retorna a função de cancelamento.
};

/**
 * Atualiza o número de apoios (upvotes) de uma ocorrência.
 * @param {string} issueId O ID da ocorrência.
 * @param {number} newUpvotes O novo número de apoios.
 */
export const updateIssueUpvotes = async (issueId: string, newUpvotes: number) => {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, { upvotes: newUpvotes });
};

/**
 * Atualiza o status de uma ocorrência.
 * @param {string} issueId O ID da ocorrência.
 * @param {Issue['status']} newStatus O novo status.
 */
export const updateIssueStatus = async (issueId: string, newStatus: Issue['status']) => {
    const issueRef = doc(db, 'issues', issueId);
    await updateDoc(issueRef, { status: newStatus });
};

/**
 * Exclui uma ocorrência do Firestore.
 * @param {string} issueId O ID da ocorrência a ser excluída.
 */
export const deleteIssue = async (issueId: string) => {
  const issueRef = doc(db, 'issues', issueId);
  await deleteDoc(issueRef);
};

/**
 * Adiciona um novo comentário a uma ocorrência.
 * @param {string} issueId O ID da ocorrência.
 * @param {string} content O conteúdo do comentário.
 * @param {AppUser} user O objeto do usuário que está comentando.
 * @throws {Error} Se o comentário estiver vazio ou o usuário não estiver autenticado.
 */
export const addCommentToIssue = async (
    issueId: string, 
    content: string,
    user: AppUser
) => {
    if (!content?.trim()) throw new Error("O comentário não pode estar vazio.");
    if (!user) throw new Error("Usuário não autenticado.");

    const issueRef = doc(db, 'issues', issueId);
    
    // Cria o objeto do novo comentário, com um ID único e timestamp.
    const newComment: CommentData = {
        id: uuidv4(),
        content: content.trim(),
        author: user.name || 'Usuário Anônimo',
        authorId: user.uid,
        authorPhotoURL: user.photoURL || null,
        authorRole: user.role, // Salva o papel do usuário no momento do comentário.
        createdAt: Timestamp.now()
    };

    // Usa `arrayUnion` para adicionar o novo comentário ao array de comentários atomicamente.
    await updateDoc(issueRef, {
        comments: arrayUnion(newComment)
    });
};

/**
 * Exclui um comentário de uma ocorrência.
 * @param {string} issueId O ID da ocorrência.
 * @param {string} commentId O ID do comentário a ser excluído.
 * @throws {Error} Se a ocorrência não for encontrada.
 */
export const deleteCommentFromIssue = async (issueId: string, commentId: string) => {
  const issueRef = doc(db, 'issues', issueId);
  const issueSnap = await getDoc(issueRef);
  if (!issueSnap.exists()) {
    throw new Error('Ocorrência não encontrada.');
  }
  
  // Para remover um item de um array no Firestore, precisamos ler o array,
  // remover o item no lado do cliente e, em seguida, reescrever o array inteiro.
  const issueData = issueSnap.data() as IssueData;
  const updatedComments = issueData.comments.filter((c: CommentData) => c.id !== commentId);

  await updateDoc(issueRef, {
    comments: updatedComments
  });
};
