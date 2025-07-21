
// src/api/questions.ts
import type { Question } from "@/types/questions";

const BASE_URL = "https://qoverflow.api.hscc.bdpa.org/v1";

export async function fetchQuestions(sorting: string): Promise<Question[]> {
    const url = `${BASE_URL}/questions/search?${sorting !== "d" ? `sort=${sorting}` : ""}`;

    const response = await fetch(url, {
        headers: {
            "Authorization": "bearer 1ded7eb6-ab91-47f7-9cf7-7d1319a32e18",  // Replace with real token
            "Content-Type": "application/json"
        }
    });
    if (response.ok) {
        console.log("questions fetched succesfully")
    }
    else {
        throw new Error("Failed to fetch questions");
    }

    const data = await response.json();
    console.log(data)
    return data.questions ?? [];
}
