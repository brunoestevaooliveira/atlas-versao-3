
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
    street: AddressComponentSchema.describe('Street name and number (e.g., "QR 517 Conjunto H")'),
    city: AddressComponentSchema.describe('City name, should default to "Santa Maria" if context suggests it'),
    state: AddressComponentSchema.describe('State, should default to "DF" (Distrito Federal) if context suggests it'),
    country: z.string().default('Brasil').describe('Country name, defaults to "Brasil"'),
    postalcode: AddressComponentSchema.describe('The postal code (CEP) as an 8-digit number string, without hyphens or spaces (e.g., "72547808")'),
}).describe('A structured address object for geocoding in Brazil.');


const prompt = ai.definePrompt({
  name: 'geocodeAddressPrompt',
  input: { schema: GeocodeAddressInputSchema },
  output: { schema: OptimizedQueryOutputSchema },
  prompt: `You are an expert in Brazilian addresses and geocoding. Your main task is to parse the user's query and structure it.

User query: {{{query}}}

- Your primary goal is to identify and extract the CEP (postal code). If a CEP is found, it MUST be returned as an 8-digit number string with no hyphens (e.g., "72547808").
- If no CEP is found, then identify street names, city, and state.
- The target area is primarily Santa Maria, DF, Brasil. Use this as a default when information is missing but the query implies this location (e.g., "QR 517").
- Structure the output as a JSON object according to the output schema. Do not add any fields that are not in the schema.`,
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
    // This creates a comma-separated query like "QR 517 Conjunto H, Santa Maria, DF, 72547808, Brasil"
    const nominatimQuery = [
      structuredAddress.street,
      structuredAddress.city,
      structuredAddress.state,
      structuredAddress.postalcode,
      structuredAddress.country
    ].filter(Boolean).join(', ');


    // 3. Call the Nominatim API, forcing the search within Brazil
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
