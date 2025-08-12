
"use server";

import { categorizeIssue } from "@/ai/flows/categorize-issue";
import type { CategorizeIssueInput } from "@/ai/flows/categorize-issue";
import { addIssue as addIssueToDb } from "@/services/issue-service";
import type { Issue } from "@/lib/types";

export async function getSuggestedCategories(input: CategorizeIssueInput) {
  try {
    const result = await categorizeIssue(input);
    return result.suggestedCategories;
  } catch (error) {
    console.error("Error getting suggested categories:", error);
    return [];
  }
}

export async function addIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'status' | 'upvotes' | 'reporter'> & { imageUrl: string }) {
  try {
    // Here you would handle file upload to a service like Firebase Storage and get the URL
    // For now, we'll use the placeholder from the form.
    
    const newIssue: Omit<Issue, 'id'> = {
      ...issueData,
      reportedAt: new Date(),
      status: 'Recebido',
      upvotes: 0,
      reporter: 'Cidadão Anônimo' // Replace with logged-in user later
    };

    await addIssueToDb(newIssue);
    return { success: true };
  } catch (error) {
    console.error("Error adding issue:", error);
    return { success: false, error: "Failed to add issue." };
  }
}
