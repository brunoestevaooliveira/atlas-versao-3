// src/components/report-form.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { addIssueClient } from "@/services/issue-service";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type FormState = {
  title: string;
  description: string;
  category: string;
  locationText: string; // "lat, lng"
};

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

  // tenta preencher com ?lat=...&lng=...
  const initialLocation = useMemo(() => {
    const lat = params.get("lat");
    const lng = params.get("lng");
    if (lat && lng) return `${lat}, ${lng}`;
    return "";
  }, [params]);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    category: "Buracos na via",
    locationText: initialLocation,
  });

  const [loading, setLoading] = useState(false);

  // garante auth anônima p/ regras que exigem request.auth
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) signInAnonymously(auth).catch(console.error);
    });
    return () => unsub();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const loc = parseLatLng(form.locationText);
      if (!loc) throw new Error("Informe a localização como 'latitude, longitude'.");

      const id = await addIssueClient({
        title: form.title,
        description: form.description,
        category: form.category,
        location: loc,
      });

      toast({
        title: "Ocorrência Enviada!",
        description: `Sua ocorrência foi registrada com sucesso. ID: ${id}`,
      });

      // limpa o formulário após sucesso
      setForm((f) => ({ ...f, title: "", description: "" }));
    } catch (err: any) {
      console.error("Falha ao enviar ocorrência:", err);
      toast({
        variant: 'destructive',
        title: 'Erro ao Enviar',
        description: err?.message ?? "ver console",
      });
    } finally {
      setLoading(false); // <-- nunca fica preso
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
             <div className="grid gap-1.5">
                 <label htmlFor="location">Localização (Latitude, Longitude)</label>
                <Input
                    id="location"
                    value={form.locationText}
                    onChange={(e) => setForm({ ...form, locationText: e.target.value })}
                    placeholder="-16.0036, -47.9872"
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
                      <SelectItem value="Buracos na via">Buracos na via</SelectItem>
                      <SelectItem value="Iluminação pública">Iluminação pública</SelectItem>
                      <SelectItem value="Lixo acumulado">Lixo acumulado</SelectItem>
                      <SelectItem value="Sinalização danificada">Sinalização danificada</SelectItem>
                      <SelectItem value="Vazamento de água">Vazamento de água</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
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