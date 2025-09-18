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
    
    const nominatimQuery = input.query;
    
    // Viewbox for Santa Maria, DF, Brazil to prioritize local results.
    // Coordinates: [lng_min, lat_min, lng_max, lat_max]
    const viewbox = '-48.05,-16.05,-47.95,-15.95';

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nominatimQuery)}&countrycodes=br&viewbox=${viewbox}&bounded=1`);
    
    if (!response.ok) {
        throw new Error(`Nominatim API failed with status ${response.status}`);
    }

    const data: GeocodeResult[] = await response.json();
    
    // If bounded search returns no results, try a broader search within Brazil.
    if (data.length === 0) {
      const broaderResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nominatimQuery)}&countrycodes=br`);
      if (broaderResponse.ok) {
        const broaderData: GeocodeResult[] = await broaderResponse.json();
        return broaderData;
      }
    }

    return data;
  }
);


export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeResult[]> {
  return geocodeAddressFlow(input);
}
