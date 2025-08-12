
"use server";

import { addIssue as addIssueToDb } from "@/services/issue-service";
import type { Issue } from "@/lib/types";

export async function addIssue(issueData: Omit<Issue, 'id' | 'reportedAt' | 'status' | 'upvotes' | 'reporter' | 'imageUrl'>) {
  try {
    const newIssue: Omit<Issue, 'id'> = {
      ...issueData,
      reportedAt: new Date(),
      status: 'Recebido',
      upvotes: 0,
      reporter: 'Cidadão Anônimo', // Replace with logged-in user later
      imageUrl: 'https://placehold.co/600x400.png', // Default placeholder
    };

    await addIssueToDb(newIssue);
    return { success: true };
  } catch (error) {
    console.error("Error adding issue:", error);
    return { success: false, error: "Failed to add issue." };
  }
}
