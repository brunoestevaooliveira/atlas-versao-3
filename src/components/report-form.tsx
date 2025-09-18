/**
 * @file src/components/report-form.tsx
 * @fileoverview Componente do formulário para criar uma nova ocorrência.
 * Ele gerencia o estado dos campos, captura as coordenadas e o endereço da URL,
 * valida os dados e lida com a submissão para o serviço do Firestore.
 */

"use client";

import { useMemo, useState, useEffect } from "react";
import { addIssueClient } from "@/services/issue-service";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";


/**
 * Define a estrutura do estado do formulário.
 */
type FormState = {
  title: string;
  description: string;
  category: string;
  address: string;
};

// Lista de categorias de ocorrências disponíveis.
const issueCategories = [
  "Limpeza urbana / Acúmulo de lixo",
  "Iluminação pública",
  "Saneamento / Vazamento de água",
  "Sinalização danificada",
  "Calçadas / Acessibilidade",
  "Trânsito / Superlotação ou parada de ônibus",
  "Meio ambiente (árvores quebradas, áreas destruídas)",
  "Segurança (como falta de policiamento, zonas escuras)",
  "Outros",
];

/**
 * Converte uma string de coordenadas "lat, lng" para um objeto de localização.
 * @param {string | null} latStr A string da latitude.
 * @param {string | null} lngStr A string da longitude.
 * @returns {{ lat: number; lng: number } | null} O objeto de localização ou null se a string for inválida.
 */
function parseLatLng(latStr: string | null, lngStr: string | null): { lat: number; lng: number } | null {
  if (!latStr || !lngStr) return null;
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

/**
 * Componente principal do formulário de relatório.
 */
export default function ReportForm() {
  const params = useSearchParams();
  const { toast } = useToast();
  const { appUser } = useAuth();
  const router = useRouter();

  // Memoiza a captura inicial do endereço da URL.
  const initialAddress = useMemo(() => {
    return params.get("address") || "";
  }, [params]);

  // Estado que armazena todos os dados do formulário.
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "Limpeza urbana / Acúmulo de lixo",
    address: initialAddress
  });

  // Estado para controlar o loading durante a submissão.
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  // Efeito que atualiza o estado do formulário se os parâmetros da URL mudarem.
  // Útil se o usuário navegar de volta para o mapa e selecionar outro ponto.
  useEffect(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    const address = params.get("address");

    const parsedLoc = parseLatLng(lat, lng);
    setLocation(parsedLoc);

    setForm(prevForm => ({
        ...prevForm,
        address: address || "",
    }));

    if (!parsedLoc) {
        toast({
            variant: 'destructive',
            title: 'Localização Inválida',
            description: 'As coordenadas não foram encontradas. Por favor, selecione um local no mapa.',
        });
        router.push('/');
    }

  }, [params, router, toast]);


  /**
   * Manipula a submissão do formulário.
   * @param {React.FormEvent} e O evento de submissão.
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (loading) return;

    // Valida se o usuário está logado.
    if (!appUser) {
        toast({
            variant: 'destructive',
            title: 'Acesso Negado',
            description: 'Você precisa estar logado para reportar uma ocorrência.',
        });
        return router.push('/login');
    }
    
    // Valida se a localização foi selecionada no mapa.
    if (!location) {
      toast({
        variant: 'destructive',
        title: 'Localização Obrigatória',
        description: 'Por favor, selecione um local no mapa na página inicial antes de continuar.',
      });
      return router.push('/');
    }

    // Valida se o endereço não está vazio (permitindo que o usuário edite).
    if (!form.address.trim()) {
      toast({
        variant: 'destructive',
        title: 'Endereço Obrigatório',
        description: 'Por favor, preencha o campo de endereço.',
      });
      return;
    }
    
    // Valida se o título começa com letra maiúscula.
    if (form.title.trim() && form.title.trim()[0] !== form.title.trim()[0].toUpperCase()) {
      toast({
        variant: 'destructive',
        title: 'Título Inválido',
        description: 'O título da ocorrência deve começar com uma letra maiúscula.',
      });
      return;
    }

    setLoading(true);

    try {
      // Chama a função do serviço para adicionar a ocorrência no Firestore.
      await addIssueClient({
        title: form.title,
        description: form.description,
        category: form.category,
        location: location,
        address: form.address,
        reporter: appUser.name || 'Cidadão Anônimo',
        reporterId: appUser.uid,
      });

      // Exibe uma notificação de sucesso.
      toast({
        title: "Ocorrência Enviada!",
        description: `Sua ocorrência (${form.title}) foi registrada com sucesso.`,
      });

      // Redireciona o usuário para a página de acompanhamento.
      router.push('/tracking');
      
    } catch (err: any) {
      // Em caso de erro, exibe uma notificação de falha.
      console.error("Falha ao enviar ocorrência:", err);
      toast({
        variant: 'destructive',
        title: 'Erro ao Enviar',
        description: err?.message ?? "Verifique o console para mais detalhes.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
       <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div className="grid gap-1.5">
                <label htmlFor="title">Título da Ocorrência</label>
                <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex.: Buraco na rua principal"
                    required
                />
            </div>
             <div className="grid gap-1.5">
                <label htmlFor="description">Descrição Detalhada</label>
                <Textarea
                    id="description"
                    rows={6}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descreva o problema com o máximo de detalhes possível."
                    required
                />
            </div>
        </div>
        <div className="space-y-6">
            <div className="grid gap-1.5">
                <label htmlFor="category">Categoria</label>
                <Select
                    value={form.category}
                    onValueChange={(value) => setForm({ ...form, category: value })}
                >
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione a categoria do problema" />
                    </SelectTrigger>
                    <SelectContent>
                    {issueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-1.5">
                <label htmlFor="address">Endereço da Ocorrência (edite se necessário)</label>
                <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Ex: QR 517, Conjunto H, Casa 10"
                    required
                />
                 <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    As coordenadas ({location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'N/A'}) foram salvas.
                </p>
            </div>
        </div>
       </div>

        <div className="flex justify-end">
             <Button type="submit" size="lg" disabled={loading || !location}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar Ocorrência
            </Button>
        </div>
    </form>
  );
}
