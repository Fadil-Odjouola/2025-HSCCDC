import type { Question } from "@/types/questions";
import dayjs from "dayjs";

export const searchQuestions = (questions: Question[], query: string): Question[] => {
  if (!query.trim()) {
    // If no query, return all questions sorted by creation date descending
    return [...questions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const lowerQuery = query.toLowerCase();

  return questions
    .filter((q) => {
      const dateStr = dayjs(q.createdAt).format("M/D/YYYY").toLowerCase();
      return (
        q.title.toLowerCase().includes(lowerQuery) ||
        q.text.toLowerCase().includes(lowerQuery) ||
        q.creator.toLowerCase().includes(lowerQuery) ||
        dateStr.includes(lowerQuery)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
