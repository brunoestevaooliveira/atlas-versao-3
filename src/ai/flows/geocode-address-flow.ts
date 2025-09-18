'use server';
/**
 * @fileOverview An AI flow for geocoding addresses in Brazil.
 *
 * - geocodeAddress - A function that takes a query and returns geocoding results.
 * - GeocodeAddressInput - The input type for the geocodeAddress function.
 * - GeocodeResult - The type for a single geocoding result.
 */

import { ai } from '@/ai/genkit';
import { GeocodeResult } from '@/lib/types';
import { z } from 'genkit';

const GeocodeAddressInputSchema = z.object({
  query: z.string().describe('The user-provided address or CEP to search for.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;


const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: z.array(z.custom<GeocodeResult>()),
  },
  async (input) => {
    
    // Simplification: Pass the user query directly to Nominatim,
    // but force the search to be within Brazil for better accuracy.
    const nominatimQuery = input.query;

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nominatimQuery)}&countrycodes=br`);
    
    if (!response.ok) {
        throw new Error(`Nominatim API failed with status ${response.status}`);
    }

    const data: GeocodeResult[] = await response.json();
    
    return data;
  }
);


export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeResult[]> {
  return geocodeAddressFlow(input);
}
