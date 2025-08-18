'use server';
/**
 * @fileOverview An AI flow to categorize urban issues.
 *
 * - categorizeIssue - A function that suggests a category for a reported issue.
 * - CategorizeIssueInput - The input type for the categorizeIssue function.
 * - CategorizeIssueOutput - The return type for the categorizeIssue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

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

export const CategorizeIssueInputSchema = z.object({
  title: z.string().describe('The title of the issue report.'),
  description: z.string().describe('The detailed description of the issue.'),
});
export type CategorizeIssueInput = z.infer<typeof CategorizeIssueInputSchema>;

export const CategorizeIssueOutputSchema = z.object({
  category: z
    .string()
    .describe(`The most relevant category for the issue. Must be one of the following: ${issueCategories.map(c => `"${c}"`).join(', ')}`),
});
export type CategorizeIssueOutput = z.infer<typeof CategorizeIssueOutputSchema>;

const prompt = ai.definePrompt({
    name: 'categorizeIssuePrompt',
    input: { schema: CategorizeIssueInputSchema },
    output: { schema: CategorizeIssueOutputSchema },
    prompt: `You are an expert in urban problem classification for the city of Santa Maria, DF, Brazil. 
Your task is to analyze the title and description of an issue reported by a citizen and assign it to the most appropriate category.

You MUST choose one of the following predefined categories:
- Limpeza urbana / Acúmulo de lixo
- Iluminação pública
- Saneamento / Vazamento de água
- Sinalização danificada
- Calçadas / Acessibilidade
- Trânsito / Superlotação ou parada de ônibus
- Meio ambiente (árvores quebradas, áreas destruídas)
- Segurança (como falta de policiamento, zonas escuras)
- Outros

Analyze the following issue:
Title: {{{title}}}
Description: {{{description}}}

Based on the information, determine the best category.
`,
});


const categorizeIssueFlow = ai.defineFlow(
  {
    name: 'categorizeIssueFlow',
    inputSchema: CategorizeIssueInputSchema,
    outputSchema: CategorizeIssueOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function categorizeIssue(input: CategorizeIssueInput): Promise<CategorizeIssueOutput> {
    return categorizeIssueFlow(input);
}
