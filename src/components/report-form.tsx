// src/components/report-form.tsx
"use client";

import { useMemo, useState } from "react";
import { addIssueClient } from "@/services/issue-service";
import { useSearchParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { categorizeIssue } from "@/ai/flows/categorize-issue-flow";

type FormState = {
  title: string;
  description: string;
  category: string;
  locationText: string; // "lat, lng"
  address: string;
};

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

function parseLatLng(text: string | null): { lat: number; lng: number } | null {
  if (!text) return null;
  const parts = text.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export default function ReportForm() {
  const params = useSearchParams();
  const { toast } = useToast();

  const initialLocation = useMemo(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    if (lat && lng) return `${lat}, ${lng}`;
    return "";
  }, [params]);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "Limpeza urbana / Acúmulo de lixo",
    locationText: initialLocation,
    address: ""
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSuggestCategory = async () => {
    if (!form.title || !form.description) {
      toast({
        variant: 'destructive',
        title: 'Dados Insuficientes',
        description: 'Por favor, preencha o título e a descrição antes de usar a sugestão da IA.',
      });
      return;
    }
    setAiLoading(true);
    try {
      const result = await categorizeIssue({ title: form.title, description: form.description });
      if (result.category && issueCategories.includes(result.category)) {
        setForm(prev => ({ ...prev, category: result.category }));
        toast({
            title: 'Categoria Sugerida!',
            description: `A IA sugeriu a categoria: "${result.category}".`,
        });
      } else {
        throw new Error('Categoria inválida retornada pela IA.');
      }
    } catch (error) {
      console.error('Erro ao sugerir categoria:', error);
      toast({
        variant: 'destructive',
        title: 'Erro da IA',
        description: 'Não foi possível sugerir uma categoria. Tente novamente.',
      });
    } finally {
      setAiLoading(false);
    }
  };


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (loading) return;

    if (!form.address.trim()) {
      toast({
        variant: 'destructive',
        title: 'Endereço Obrigatório',
        description: 'Por favor, preencha o campo de endereço.',
      });
      return;
    }

    setLoading(true);

    try {
      const loc = parseLatLng(form.locationText);
      if (!loc) throw new Error("Localização inválida. Clique no mapa para definir um ponto.");

      const reporterName = 'Cidadão Anônimo';

      await addIssueClient({
        title: form.title,
        description: form.description,
        category: form.category,
        location: loc,
        address: form.address,
        reporter: reporterName,
      });

      toast({
        title: "Ocorrência Enviada!",
        description: `Sua ocorrência (${form.title}) foi registrada com sucesso.`,
      });

      // limpa o formulário após sucesso
      setForm({ ...form, title: "", description: "", address: ""});
    } catch (err: any) {
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
                <div className="flex items-center gap-2">
                    <Select
                        value={form.category}
                        onValueChange={(value) => setForm({ ...form, category: value })}
                    >
                        <SelectTrigger id="category" className="flex-grow">
                            <SelectValue placeholder="Selecione a categoria do problema" />
                        </SelectTrigger>
                        <SelectContent>
                        {issueCategories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSuggestCategory}
                        disabled={aiLoading}
                        title="Sugerir categoria com IA"
                    >
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
             <div className="grid gap-1.5">
                 <label htmlFor="location">Localização (preenchida ao clicar no mapa)</label>
                <Input
                    id="location"
                    value={form.locationText}
                    onChange={(e) => setForm({ ...form, locationText: e.target.value })}
                    placeholder="Clique no mapa na página inicial para definir"
                    required
                    readOnly
                    className="bg-gray-100"
                />
            </div>
            <div className="grid gap-1.5">
                <label htmlFor="address">Endereço ou Ponto de Referência</label>
                <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Ex: Quadra 15, Conjunto C, em frente ao mercado"
                    required
                />
            </div>
        </div>
       </div>

        <div className="flex justify-end">
             <Button type="submit" size="lg" disabled={loading}>
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
