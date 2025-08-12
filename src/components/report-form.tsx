
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Camera, Send, Loader2, Sparkles, MapPin } from 'lucide-react';
import { getSuggestedCategories, addIssue } from '../app/report/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { useSearchParams } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres.'),
  photo: z.any().refine(file => file?.length == 1, 'A foto é obrigatória.'),
  category: z.string().min(1, 'A categoria é obrigatória.'),
  location: z.string().min(3, 'A localização é obrigatória.'),
});

const ReportForm = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isAiLoading, startAiTransition] = useTransition();
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


  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        if (form.getValues('description')) {
          handleCategorize(form.getValues('description'), reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    const description = event.target.value;
    if (description && photoPreview) {
      handleCategorize(description, photoPreview);
    }
  };

  const handleCategorize = (description: string, photoDataUri: string) => {
    startAiTransition(async () => {
      const suggestions = await getSuggestedCategories({ description, photoDataUri });
      setSuggestedCategories(suggestions);
      if (suggestions.length > 0) {
        toast({
          title: 'Sugestões de Categoria',
          description: 'A IA sugeriu algumas categorias para sua ocorrência.',
        });
      }
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const [lat, lng] = values.location.split(',').map(Number);
    
    // In a real app, you'd upload the photo to a service like Firebase Storage
    // and get a URL. For now, we'll use a placeholder.
    const imageUrl = 'https://placehold.co/600x400.png';

    const result = await addIssue({
      title: values.title,
      description: values.description,
      category: values.category,
      location: { lat, lng },
      imageUrl: imageUrl, // Placeholder for now
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Ocorrência Enviada!',
        description: 'Agradecemos sua colaboração. Sua ocorrência foi registrada com sucesso.',
      });
      form.reset();
      setPhotoPreview(null);
      setSuggestedCategories([]);
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
                      onBlur={handleDescriptionBlur}
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
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto do Problema</FormLabel>
                  <FormControl>
                    <Card className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed h-64">
                      {photoPreview ? (
                        <Image src={photoPreview} alt="Pré-visualização" layout="fill" objectFit="cover" className="rounded-md" />
                      ) : (
                        <div className="text-center text-muted-foreground space-y-2">
                          <Camera className="mx-auto h-12 w-12" />
                          <p>Clique para enviar ou arraste uma foto</p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          handlePhotoChange(e);
                        }}
                      />
                    </Card>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      {suggestedCategories.length > 0 && (
                        <>
                          {suggestedCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              <span className='flex items-center'>{cat} <Sparkles className="ml-2 h-4 w-4 text-yellow-400" /></span>
                            </SelectItem>
                          ))}
                        </>
                      )}
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
             {isAiLoading && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando imagem e descrição para sugerir categorias...
                </div>
            )}
             {suggestedCategories.length > 0 && !isAiLoading && (
                <div className="space-y-2">
                    <p className='text-sm font-medium'>Categorias Sugeridas:</p>
                    <div className='flex flex-wrap gap-2'>
                        {suggestedCategories.map(cat => (
                            <Badge key={cat} variant='secondary' className='cursor-pointer' onClick={() => form.setValue('category', cat)}>{cat}</Badge>
                        ))}
                    </div>
                </div>
            )}
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
