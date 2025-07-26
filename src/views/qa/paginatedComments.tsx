import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "./markdown"; // Optional: replace with your own Markdown or plain <p> renderer
import level from "@/api/levelSys";


dayjs.extend(relativeTime);

const PAGE_SIZE = 3;

export interface Comment {
  comment_id: string;
  creator: string;
  title: string;
  text: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

interface PaginatedCommentsProps {
  comments: Comment[];
  isLoading?: boolean;
  isError?: boolean;
}

const PaginatedComments: React.FC<PaginatedCommentsProps> = ({
  comments,
  isLoading = false,
  isError = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(comments.length / PAGE_SIZE);
  const paginatedComments = comments.slice(
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

  // States
  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500 animate-pulse">
        Loading comments...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load comments.
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No comments yet.</div>
    );
  }

  // Render
  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait" initial={false}>
        {paginatedComments.map((comment) => (
          <motion.div
            key={comment.comment_id}
            className="border rounded-lg p-4 shadow-sm bg-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col space-y-2 text-sm text-gray-700 max-w-[700px]">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.creator}
                    alt={comment.creator}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-medium">{comment.creator} </span>
                </div>
                <div className="text-xs text-gray-500 flex flex-row gap-3 translate-x-30">
                  {dayjs(comment.createdAt).format("MMM D, YYYY")} |{" "}
                  {dayjs(comment.createdAt).fromNow()}
                  <div>Points: {comment.upvotes - comment.downvotes}</div>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <div>{comment.text}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 pt-4 flex-wrap">
        {/* Mobile prev/next */}
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

        {/* Desktop numbered pagination */}
        {getPageButtons()}
      </div>
    </div>
  );
};

export default PaginatedComments;
