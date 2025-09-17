'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a summary of key data points from Firestore collections, tailored for managers.
 *
 * - dataSummaryForManagers - An async function that takes a Firestore collection name as input and returns a summary of the data.
 * - DataSummaryForManagersInput - The input type for the dataSummaryForManagers function.
 * - DataSummaryForManagersOutput - The output type for the dataSummaryForManagers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataSummaryForManagersInputSchema = z.object({
  collectionName: z.string().describe('The name of the Firestore collection to summarize.'),
});
export type DataSummaryForManagersInput = z.infer<typeof DataSummaryForManagersInputSchema>;

const DataSummaryForManagersOutputSchema = z.object({
  summary: z.string().describe('A summary of the key data points in the Firestore collection.'),
});
export type DataSummaryForManagersOutput = z.infer<typeof DataSummaryForManagersOutputSchema>;

export async function dataSummaryForManagers(input: DataSummaryForManagersInput): Promise<DataSummaryForManagersOutput> {
  return dataSummaryForManagersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dataSummaryForManagersPrompt',
  input: {schema: DataSummaryForManagersInputSchema},
  output: {schema: DataSummaryForManagersOutputSchema},
  prompt: `You are an AI assistant helping managers understand their Firestore data.
  Summarize the key data points from the following Firestore collection: {{{collectionName}}}.  Focus on trends and important metrics.  The summary should be concise and easy to understand for a manager. Assume that the data is already fetched and available, so you don't need to call any tools to fetch the data.
  Make sure your response is less than 200 words.
  `,
});

const dataSummaryForManagersFlow = ai.defineFlow(
  {
    name: 'dataSummaryForManagersFlow',
    inputSchema: DataSummaryForManagersInputSchema,
    outputSchema: DataSummaryForManagersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
