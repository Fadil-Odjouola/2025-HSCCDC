import { useEffect, useState } from "react";
import type { Question } from "@/types/questions";
import { fetchQuestions } from "@/api/questions";

type SortType = "u" | "uvc" | "uvac";

const sortFunctions: Record<SortType, (a: Question, b: Question) => number> = {
  u: (a, b) => b.upvotes - a.upvotes,
  uvc: (a, b) =>
    b.upvotes + b.views + b.comments - (a.upvotes + a.views + a.comments),
  uvac: (a, b) =>
    b.upvotes +
    b.views +
    b.answers +
    b.comments -
    (a.upvotes + a.views + a.answers + a.comments),
};

function QuestionCard({ question }: { question: Question }) {
  return (
    <a href={`/questions/${question.question_id}`}>
      <div className="rounded-2xl border p-4 hover:shadow-lg transition-all duration-300 bg-white mb-3 w-[325px] h-max">
        <div className="text-xl font-semibold mb-1 text-gray-800">
          {question.title}
        </div>

        <div className="text-sm text-gray-700 flex flex-col gap-1">
          <span className="mr-2 text-[16px]">
            <span className="font-bold">Votes:</span> {question.upvotes-question.downvotes}
          </span>
          <span className="mr-2  text-[16px]">
            <span className="font-bold">Views:</span> {question.views}
          </span>
          <span className="mr-2  text-[16px]">
            <span className="font-bold">Comments:</span> {question.comments}
          </span>
          <span className="mr-2 text-[16px]">
            <span className="font-bold">Creator:</span> {question.creator}
          </span>
          <span>{question.createAt} 📅 {new Date(question.createAt).toLocaleDateString()}</span>
        </div>
      </div>
    </a>
  );
}

export default function Buffet() {
  const [sortType, setSortType] = useState<SortType>("u");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const questionsPerPage = 12;
  const sortedQuestions = [...questions]
    .sort(sortFunctions[sortType])
    .slice(0, 100);
  const totalPages = Math.ceil(sortedQuestions.length / questionsPerPage);
  const indexOfLast = currentPage * questionsPerPage;
  const indexOfFirst = indexOfLast - questionsPerPage;
  const currentQuestions = sortedQuestions.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchQuestions(sortType);
        setQuestions(response);
      } catch (error: any) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [sortType]);

  useEffect(() => {
    questions.map((q) => {
        console.log(q.createAt)
    })
  })

  if (isLoading) {
    return (
      <div className="pt-16 p-6 max-w-3xl mx-auto bg-gray-50 rounded-xl shadow-sm mt-20 text-center text-gray-700">
        Loading questions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 p-6 max-w-3xl mx-auto bg-red-50 rounded-xl shadow-sm mt-20 text-center text-red-600">
        Error loading questions: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="pt-16 p-6 max-w-3xl mx-auto space-y-4 bg-gray-50 rounded-xl shadow-sm mt-20">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setSortType("u")}
          className={`px-4 py-2 rounded-lg transition ${
            sortType === "u"
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          }`}
        >
          Best
        </button>
        <button
          onClick={() => setSortType("uvc")}
          className={`px-4 py-2 rounded-lg transition ${
            sortType === "uvc"
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          }`}
        >
          Interesting
        </button>
        <button
          onClick={() => setSortType("uvac")}
          className={`px-4 py-2 rounded-lg transition ${
            sortType === "uvac"
              ? "bg-gray-800 text-white hover:bg-gray-700"
              : "bg-gray-300 text-gray-800 hover:bg-gray-400"
          }`}
        >
          Hottest
        </button>
      </div>

      <div className="space-y-2 flex flex-row flex-wrap gap-4">
        {currentQuestions.length === 0 ? (
          <div className="text-center text-gray-500">No questions found.</div>
        ) : (
          currentQuestions.map((q) => (
            <QuestionCard key={q.question_id} question={q} />
          ))
        )}
      </div>

      <div className="flex justify-center space-x-1 mt-4">
        {currentPage > 2 && <span className="px-2 select-none">...</span>}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (num) =>
              num === 1 ||
              num === totalPages ||
              Math.abs(num - currentPage) <= 1
          )
          .map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 rounded-lg border transition ${
                num === currentPage
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}
        {currentPage < totalPages - 1 && (
          <span className="px-2 select-none">...</span>
        )}
      </div>
    </div>
  );
}
