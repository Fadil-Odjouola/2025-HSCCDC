import type { Question } from "@/types/questions";

export const searchQuestions = (questions: Question[], query: string): Question[] => {
  if (!query.trim()) return [...questions].sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());

  const lowerQuery = query.toLowerCase();

  return questions
    .filter((q) =>
      q.title.toLowerCase().includes(lowerQuery) ||
      q.text.toLowerCase().includes(lowerQuery) ||
      q.creator.toLowerCase().includes(lowerQuery) 
    )
    .sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());
};
