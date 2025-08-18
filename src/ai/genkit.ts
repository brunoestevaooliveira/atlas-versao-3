'use server';
/**
 * @fileoverview This file initializes the Genkit AI plugin.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {AlwaysOnSampler, configureGenkit} from 'genkit/experimental/tracing';

// Note: might be useful to set GENKIT_ENV=dev in your local .env file.
// If not set, it defaults to 'prod'
if (!process.env.GENKIT_ENV || process.env.GENKIT_ENV !== 'prod') {
  configureGenkit({
    // Log developer-level details to the console.
    enableTracing: true,
    traceStore: {
      provider: 'dev',
      options: {
        sampler: new AlwaysOnSampler(),
      },
    },
  });
}

export const ai = genkit({
  plugins: [
    googleAI({
      // You can specify the model's API version here, but it's optional.
      // apiVersion: 'v1beta',
    }),
  ],
});
