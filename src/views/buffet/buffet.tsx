import { useEffect, useState } from "react";
import type { Question } from "@/types/questions";
import { fetchQuestions } from "@/api/questions";
import { useSearch } from "@/context/SearchContext";
import { searchQuestions } from "@/utility/searchQuestions";
import { Button } from "@/components/miniUI/button";
import Popover from "./extra/Popover";
import dayjs from "dayjs";
import { getUserLocal } from "@/components/backendUserLocal";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";


type SortType = "recent" | "best" | "interesting" | "hot";

const sortMap: Record<Exclude<SortType, "recent">, "u" | "uvc" | "uvac"> = {
  best: "u",
  interesting: "uvc",
  hot: "uvac",
};

function QuestionCard({ question }: { question: Question }) {
  return (
    <motion.a
      href={`/question/${question.question_id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full sm:w-[48%] lg:w-[31%]"
    >
      <div className="rounded-2xl border p-4 hover:shadow-xl transition-all duration-300 bg-white mb-3 h-full">
        <div className="text-lg sm:text-xl font-semibold mb-1 text-gray-800">
          {question.title}
        </div>
        <div className="text-sm text-gray-700 flex flex-col gap-1">
          <span className="text-[16px]">
            <span className="font-bold">Votes:</span>{" "}
            {question.upvotes - question.downvotes}
          </span>
          <span className="text-[16px]">
            <span className="font-bold">Views:</span> {question.views}
          </span>
          <span className="text-[16px]">
            <span className="font-bold">Comments:</span> {question.comments}
          </span>
          <span className="text-[16px]">
            <span className="font-bold">Answers:</span> {question.answers}
          </span>
          <span className="text-[16px]">
            <span className="font-bold">Creator:</span> {question.creator}
          </span>
          <span className="text-xs text-gray-500">
            {dayjs(question.createdAt).format("M/D/YYYY")} -{" "}
            {dayjs(question.createdAt).fromNow()}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function Buffet() {
  const [sortType, setSortType] = useState<SortType>("recent");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoggedin, setLoggedIn] = useState(false);
  const { searchQuery } = useSearch();
  const { user } = useUser();

  const filteredQuestions = searchQuestions(questions, searchQuery);
  const currentQuestions = filteredQuestions
    .slice(0, 100)
    .slice((currentPage - 1) * 12, currentPage * 12);
  const totalPages = Math.ceil(Math.min(filteredQuestions.length, 100) / 12);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortType]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (sortType === "recent") {
          const response = await fetchQuestions();
          setQuestions(response);
        } else {
          const response = await fetchQuestions(sortMap[sortType]);
          setQuestions(response);
        }
      } catch (error: any) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [sortType]);

  useEffect(() => {
    const localUser = getUserLocal();
    if (localUser) {
      setLoggedIn(true);
    }
  }, []);

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
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75}}
      className="pt-16 p-4 sm:p-6 max-w-screen-xl mx-auto space-y-6 bg-gray-50 rounded-xl shadow-md mt-20"
    >
      {/* Sort and Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4">
        <div className="flex flex-wrap gap-2">
          {(["recent", "best", "interesting", "hot"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSortType(type)}
              className={`px-4 py-2 rounded-full font-medium transition text-sm sm:text-base border ${
                sortType === type
                  ? "bg-gray-800 text-white border-transparent shadow-sm"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        {isLoggedin && (
          <Button
            className="bg-blue-600 p-2 px-4 font-bold text-white hover:bg-blue-700 transition-all duration-300 ease-linear rounded-full shadow"
            onClick={() => setShow(true)}
          >
            Create a question
          </Button>
        )}
      </div>

      {show && <Popover onClose={() => setShow(false)} />}

      {/* Questions */}
      <div className="flex flex-wrap gap-4 justify-start">
        {currentQuestions.length === 0 ? (
          <div className="text-center text-gray-500 w-full">
            No questions found.
          </div>
        ) : (
          currentQuestions.map((q) => (
            <QuestionCard key={q.question_id} question={q} />
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center flex-wrap gap-1 mt-4">
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
              className={`px-3 py-1 rounded-lg border text-sm transition ${
                num === currentPage
                  ? "bg-gray-800 text-white border-transparent"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}
        {currentPage < totalPages - 1 && (
          <span className="px-2 select-none">...</span>
        )}
      </div>
    </motion.div>
  );
}
