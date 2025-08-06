"use server";

import { categorizeIssue } from "@/ai/flows/categorize-issue";
import type { CategorizeIssueInput } from "@/ai/flows/categorize-issue";

export async function getSuggestedCategories(input: CategorizeIssueInput) {
  try {
    const result = await categorizeIssue(input);
    return result.suggestedCategories;
  } catch (error) {
    console.error("Error getting suggested categories:", error);
    return [];
  }
}
