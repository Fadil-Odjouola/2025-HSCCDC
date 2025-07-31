import type { Question } from "@/types/questions";

const BASE_URL = "https://qoverflow.api.hscc.bdpa.org/v1";

export async function fetchQuestions(
  sorting: "d" | "u" | "uvc" | "uvac" = "d",
  afterId?: string
): Promise<Question[]> {
  let url = `${BASE_URL}/questions/search?`;
  if (sorting !== "d") {
    url += `sort=${sorting}`;
  }
  if (afterId) {
    url += `${sorting !== "d" ? "&" : ""}after=${afterId}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: "bearer 1ded7eb6-ab91-47f7-9cf7-7d1319a32e18",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch questions");

  const data = await response.json();
  return data.questions ?? [];
}
