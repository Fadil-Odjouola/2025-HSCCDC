import React, { useState , useEffect} from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "./markdown";
import level from "@/api/levelSys";
import { getuserobj } from "../auth/signup/backendauth";


const apikey = "1ded7eb6-ab91-47f7-9cf7-7d1319a32e18";

const PAGE_SIZE = 3;
dayjs.extend(relativeTime);
interface Answer {
  answer_id: string;
  creator: string;
  createdAt: string;
  text: string;
  upvotes: number;
  downvotes: number;
}

interface PaginatedAnswersProps {
  answers: Answer[];
  isLoading?: boolean;
  isError?: boolean;
}

export const PaginatedAnswers = ({
  answers,
  isLoading = false,
  isError = false,
}: PaginatedAnswersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [commenterLevels, setCommenterLevels] = useState<Record<string, number>>({});

  const totalPages = Math.ceil(answers.length / PAGE_SIZE);
  const paginatedAnswers = answers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageButtons = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    const getLevel = async (creator: string) => {
        const userinfo = await getuserobj(creator, apikey)
        return level(userinfo.points)
    }

    useEffect(() => {
  const fetchLevels = async () => {
    const levelsMap: Record<string, number> = {};
    for (const answer of answers) {
      const username = answer.creator;
      if (!(username in levelsMap)) {
        const userinfo = await getuserobj(username, apikey)
        console.log(userinfo)
        const lvl = level(userinfo.user.points);
        levelsMap[username] = lvl;
      }
    }

    setCommenterLevels(levelsMap);
  };

  if (answers.length > 0) fetchLevels();
}, [answers]);


    return (
      <div className="hidden sm:flex gap-2">
        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={i} className="px-2 py-1 text-gray-500 select-none">
              {p}
            </span>
          ) : (
            <button
              key={i}
              onClick={() => changePage(p)}
              className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                p === currentPage
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500 animate-pulse">
        Loading answers...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load answers. Please try again later.
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No answers yet. Be the first to respond!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait" initial={false}>
        {paginatedAnswers.map((answer) => (
          <motion.div
            key={answer.answer_id}
            className="border rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col text-sm text-gray-500 w-[800px] h-max">
              <div className="flex items-center justify-between ">
                <div className="flex items-center gap-2">
                  <img
                    src={answer.creator}
                    alt={answer.creator}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{answer.creator} <br/> Level: {commenterLevels[answer.creator]}</span>
                </div>
                <div>
                  {dayjs(answer.createdAt).format("M/D/YYYY")} -{" "}
                  {dayjs(answer.createdAt).fromNow()} | Points:{" "}
                  {answer.upvotes - answer.downvotes}
                </div>
              </div>
              <div className="w-full max-w-[600px] break-words whitespace-pre-wrap mt-2">
                <MarkdownRenderer body={answer.text} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 pt-4 flex-wrap">
        {/* Mobile Prev/Next */}
        <div className="flex sm:hidden gap-2">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Desktop pagination */}
        {getPageButtons()}
      </div>
    </div>
  );
};
