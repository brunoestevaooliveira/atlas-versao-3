
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

// Define the schema for a single address component, which can be a string or undefined
const AddressComponentSchema = z.string().optional();

// Define the schema for the structured address that the LLM will return
const OptimizedQueryOutputSchema = z.object({
    street: AddressComponentSchema.describe('Street name and number'),
    city: AddressComponentSchema.describe('City name, usually Santa Maria'),
    state: AddressComponentSchema.describe('State, usually DF (Distrito Federal)'),
    country: z.string().default('Brasil').describe('Country name, defaults to Brasil'),
    postalcode: AddressComponentSchema.describe('The postal code (CEP)'),
}).describe('A structured address object for geocoding.');


const prompt = ai.definePrompt({
  name: 'geocodeAddressPrompt',
  input: { schema: GeocodeAddressInputSchema },
  output: { schema: OptimizedQueryOutputSchema },
  prompt: `You are an expert in Brazilian addresses and geocoding. Your task is to parse the user's query and convert it into a structured format optimized for the Nominatim (OpenStreetMap) API.

User query: {{{query}}}

- If the query contains a CEP (postal code), extract it.
- Identify street names, city, and state.
- The target area is primarily Santa Maria, DF, Brasil. Use this as a default when information is missing.
- Structure the output as a JSON object.`,
});


const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: z.array(z.custom<GeocodeResult>()),
  },
  async (input) => {
    // 1. Get the structured address from the LLM
    const llmResponse = await prompt(input);
    const structuredAddress = llmResponse.output;

    if (!structuredAddress) {
      throw new Error('AI failed to parse the address.');
    }
    
    // 2. Build the query string for Nominatim from the structured address
    // This creates a comma-separated query like "QR 517 Conjunto H, Santa Maria, DF, Brasil"
    const nominatimQuery = [
      structuredAddress.street,
      structuredAddress.city,
      structuredAddress.state,
      structuredAddress.postalcode,
      structuredAddress.country
    ].filter(Boolean).join(', ');


    // 3. Call the Nominatim API
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nominatimQuery)}&viewbox=-48.05,-16.05,-47.95,-15.95&bounded=1`);
    
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
