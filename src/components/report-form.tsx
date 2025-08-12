
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2, MapPin } from 'lucide-react';
import { addIssue } from '../app/report/actions';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres.'),
  category: z.string().min(1, 'A categoria é obrigatória.'),
  location: z.string().min(3, 'A localização é obrigatória.'),
});

const ReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location: '',
    },
  });

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      const locationString = `${lat}, ${lng}`;
      form.setValue('location', locationString, { shouldValidate: true });
    }
  }, [searchParams, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const [lat, lng] = values.location.split(',').map(Number);
    
    const result = await addIssue({
      title: values.title,
      description: values.description,
      category: values.category,
      location: { lat, lng },
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Ocorrência Enviada!',
        description: 'Agradecemos sua colaboração. Sua ocorrência foi registrada com sucesso.',
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro ao Enviar',
        description: result.error || 'Não foi possível registrar a ocorrência. Tente novamente.',
      });
    }
  };

  const isLocationFromMap = !!(searchParams.get('lat') && searchParams.get('lng'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Ocorrência</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Buraco na rua principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o problema com o máximo de detalhes possível."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização (Latitude, Longitude)</FormLabel>
                   <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Clique no mapa para selecionar ou digite as coordenadas" 
                        {...field} 
                        className="pl-10"
                        disabled={isLocationFromMap} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria do problema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Buracos na via">Buracos na via</SelectItem>
                      <SelectItem value="Iluminação pública">Iluminação pública</SelectItem>
                      <SelectItem value="Lixo acumulado">Lixo acumulado</SelectItem>
                      <SelectItem value="Sinalização danificada">Sinalização danificada</SelectItem>
                      <SelectItem value="Vazamento de água">Vazamento de água</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Enviar Ocorrência
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReportForm;
