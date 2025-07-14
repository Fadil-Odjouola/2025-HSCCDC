import { useEffect, useState } from "react";
import "./index.css"

const BASE_URL = "https://qoverflow.api.hscc.bdpa.org/v1"

interface Question {
    creator: string;
    title: string;
    createAt: number;
    text: string;
    status: string;
    hasAcceptedAnswer: boolean;
    upvotes: number;
    downvotes: number;
    answers: number;
    views: number;
    comments: number;
    question_id: number;
}




export default function Buffet() {
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [sorting, setSorting] = useState("d");
    // there are 3 types of sorting: u (by most upvotes; labeled as "Best"), uvc(by most upvotes, views, and comments; labeled as "Interesting"), and uvac (by most upvotes, views, answers and comments; labeled as "Hottest")
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);

            try {
                const response = await fetch( `${BASE_URL}/questions/search?${sorting!="d" ? `sort=${sorting}` : ""}`,{
                    headers: {
                    "Authorization": "bearer 1ded7eb6-ab91-47f7-9cf7-7d1319a32e18",
                    "Content-Type": "application/json"
                    }
                });
                const data = await response.json();
                setQuestions(data.questions ?? []);
            } catch (error: any) {
                setError(error);
            } finally{
                setIsLoading(false);
            }
            
        };

        fetchPosts();
    }, [sorting]);

    const getButtonClass = (value: string) =>
        sorting === value ? "sort-button active" : "sort-button";

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Something went wrong. Try Again.</div>
    }

    return <>
        <h1>Buffet</h1>
        <div></div>
        <div className="sort-controls">
            <span>Sort by:</span>
            <button onClick={() => setSorting("d")} className={getButtonClass("d")} style={{backgroundColor: sorting === "d" ? "grey" : "white"}}>
                Latest
            </button>
            <button onClick={() => setSorting("u")} className={getButtonClass("u")} style={{backgroundColor: sorting === "u" ? "grey" : "white"}}>
                Best
            </button>
            <button onClick={() => setSorting("uvc")} className={getButtonClass("uvc")} style={{backgroundColor: sorting === "uvc" ? "grey" : "white"}}>
                Interesting
            </button>
            <button onClick={() => setSorting("uvac")} className={getButtonClass("uvac")} style={{backgroundColor: sorting === "uvac" ? "grey" : "white"}}>
                Hottest
            </button>
        </div>
        <ul>
            {questions.map((question) => (
                <li key={question.question_id}>
                    <div><strong>{question.title}</strong></div>
                    <div>Upvotes: {question.upvotes}</div>
                    <div>Views: {question.views}</div>
                    <div>Comments: {question.comments}</div>
                    <div>By: {question.creator}</div>
                    <div>Date: {new Date(question.createAt).toLocaleString()}</div>
                </li>
            ))}
        </ul>
    </>
}