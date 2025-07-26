import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "./markdown";
import level from "@/api/levelSys";
import { getuserobj } from "../auth/signup/backendauth";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { answerPointsUpdate } from "./backendQA";
import { useUser } from "@/context/UserContext";


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
  question_id: string;
}

export const PaginatedAnswers = ({
  question_id,
  answers,
  isLoading = false,
  isError = false,
}: PaginatedAnswersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [commenterLevels, setCommenterLevels] = useState<
    Record<string, number>
  >({});
  const [voteCounts, setVoteCounts] = useState<
    Record<string, { upvotes: number; downvotes: number }>
  >({});
  const [voteAnimations, setVoteAnimations] = useState<
    Record<string, string | null>
  >({});

  const totalPages = Math.ceil(answers.length / PAGE_SIZE);
  const paginatedAnswers = answers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  useEffect(() => {
    const fetchLevels = async () => {
      const levelsMap: Record<string, number> = {};
      for (const answer of answers) {
        const username = answer.creator;
        if (!(username in levelsMap)) {
          const userinfo = await getuserobj(username, apikey);
          const lvl = level(userinfo.user.points);
          levelsMap[username] = lvl;
        }
      }
      setCommenterLevels(levelsMap);
    };

    if (answers.length > 0) fetchLevels();

    // Initialize vote counts
    const voteInit: Record<string, { upvotes: number; downvotes: number }> = {};
    answers.forEach((a) => {
      voteInit[a.answer_id] = { upvotes: a.upvotes, downvotes: a.downvotes };
    });
    setVoteCounts(voteInit);
  }, [answers]);

  const getPageButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

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

  const handleVote = async (id: string, type: "up" | "down") => {
    setVoteCounts((prev) => {
      const curr = prev[id];
      if (type == "up") {
        curr;
        const updated = { ...curr, up: curr.upvotes + 1 };
        setVoteAnimations((prev) => ({ ...prev, [id]: type }));
        answerPointsUpdate(question_id, id, "increment", )
        return { ...prev, [id]: updated };
      } else {
        const updated = { ...curr, down: curr.downvotes + 1 };
        return { ...prev, [id]: updated };
      }
    });

    setTimeout(() => {
      setVoteAnimations((prev) => ({ ...prev, [id]: null }));
    }, 800);
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
                  <span>
                    {answer.creator} <br /> Level:{" "}
                    {commenterLevels[answer.creator]}
                  </span>
                </div>
                <div>
                  {dayjs(answer.createdAt).format("M/D/YYYY")} -{" "}
                  {dayjs(answer.createdAt).fromNow()} | Points:{" "}
                  {voteCounts[answer.answer_id]?.upvotes -
                    voteCounts[answer.answer_id]?.downvotes}
                </div>
              </div>

              <div className="w-full max-w-[600px] break-words whitespace-pre-wrap mt-2">
                <MarkdownRenderer body={answer.text} />
              </div>

              <div className="flex gap-3 mt-4 items-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleVote(answer.answer_id, "up")}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-full text-sm text-white"
                >
                  <ThumbsUp className="w-4 h-4" />{" "}
                  {voteCounts[answer.answer_id]?.upvotes}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleVote(answer.answer_id, "down")}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full text-sm text-white"
                >
                  <ThumbsDown className="w-4 h-4" />{" "}
                  {voteCounts[answer.answer_id]?.downvotes}
                </motion.button>

                <AnimatePresence>
                  {voteAnimations[answer.answer_id] && (
                    <motion.div
                      key="vote-float"
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: -20 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.6 }}
                      className={`text-xl font-bold ${
                        voteAnimations[answer.answer_id] === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {voteAnimations[answer.answer_id] === "up" ? "+1" : "-1"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-center items-center gap-2 pt-4 flex-wrap">
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
        {getPageButtons()}
      </div>
    </div>
  );
};
