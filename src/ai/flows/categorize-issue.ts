// src/ai/flows/categorize-issue.ts
'use server';

/**
 * @fileOverview An AI agent that suggests relevant categories for a reported issue based on the description and attached photo.
 *
 * - categorizeIssue - A function that suggests categories for a reported issue.
 * - CategorizeIssueInput - The input type for the categorizeIssue function.
 * - CategorizeIssueOutput - The return type for the categorizeIssue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeIssueInputSchema = z.object({
  description: z.string().describe('The description of the reported issue.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CategorizeIssueInput = z.infer<typeof CategorizeIssueInputSchema>;

const CategorizeIssueOutputSchema = z.object({
  suggestedCategories: z
    .array(z.string())
    .describe('An array of suggested categories for the reported issue.'),
});
export type CategorizeIssueOutput = z.infer<typeof CategorizeIssueOutputSchema>;

export async function categorizeIssue(input: CategorizeIssueInput): Promise<CategorizeIssueOutput> {
  return categorizeIssueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeIssuePrompt',
  input: {schema: CategorizeIssueInputSchema},
  output: {schema: CategorizeIssueOutputSchema},
  prompt: `You are a helpful assistant that suggests categories for reported urban issues.

  Based on the description and the attached photo, suggest up to 5 relevant categories for the issue.
  Description: {{{description}}}
  Photo: {{media url=photoDataUri}}

  Return the categories as a JSON array of strings.`,
});

const categorizeIssueFlow = ai.defineFlow(
  {
    name: 'categorizeIssueFlow',
    inputSchema: CategorizeIssueInputSchema,
    outputSchema: CategorizeIssueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
