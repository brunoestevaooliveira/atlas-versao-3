
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

type FormState = {
  title: string;
  description: string;
  category: string;
  locationText: string;
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
  const { appUser } = useAuth();
  const router = useRouter();

  const initialLocation = useMemo(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    if (lat && lng) return `${lat}, ${lng}`;
    return "";
  }, [params]);
  
  const initialAddress = useMemo(() => {
    return params.get("address") || "";
  }, [params]);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "Limpeza urbana / Acúmulo de lixo",
    locationText: initialLocation,
    address: initialAddress
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    const address = params.get("address");

    setForm(prevForm => ({
        ...prevForm,
        locationText: lat && lng ? `${lat}, ${lng}` : "",
        address: address || "",
    }));

  }, [params]);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (loading) return;

    if (!appUser) {
        toast({
            variant: 'destructive',
            title: 'Acesso Negado',
            description: 'Você precisa estar logado para reportar uma ocorrência.',
        });
        return router.push('/login');
    }

    if (!form.locationText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Localização Obrigatória',
        description: 'Por favor, selecione um local no mapa na página inicial antes de continuar.',
      });
      return router.push('/');
    }

    if (!form.address.trim()) {
      toast({
        variant: 'destructive',
        title: 'Endereço Obrigatório',
        description: 'Por favor, preencha o campo de endereço.',
      });
      return;
    }
    
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
      const loc = parseLatLng(form.locationText);
      if (!loc) throw new Error("Localização inválida. Clique no mapa para definir um ponto.");

      await addIssueClient({
        title: form.title,
        description: form.description,
        category: form.category,
        location: loc,
        address: form.address,
        reporter: appUser.name || 'Cidadão Anônimo',
        reporterId: appUser.uid,
      });

      toast({
        title: "Ocorrência Enviada!",
        description: `Sua ocorrência (${form.title}) foi registrada com sucesso.`,
      });

      router.push('/tracking');
      
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
                    As coordenadas ({form.locationText}) foram salvas.
                </p>
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
