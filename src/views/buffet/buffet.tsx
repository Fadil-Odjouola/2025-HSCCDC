import { useEffect, useRef, useState, useMemo, useCallback } from "react";
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
import { useUserCache } from "@/context/userCacheContext";
import { useUsers } from "@/context/usersContext";
import hashEmail from "@/utility/emailhash";

type SortType = "recent" | "best" | "interesting" | "hot";

const sortMap: Record<SortType, "d" | "u" | "uvc" | "uvac"> = {
  recent: "d",
  best: "u",
  interesting: "uvc",
  hot: "uvac",
};

const MAX_MATCHED = 100;

function QuestionCard({
  question,
  hashedemail,
  levels,
}: {
  question: Question;
  hashedemail: string;
  levels: number;
}) {
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
            <b>Votes:</b> {question.upvotes - question.downvotes}
          </span>
          <span className="text-[16px]">
            <b>Views:</b> {question.views}
          </span>
          <span className="text-[16px]">
            <b>Comments:</b> {question.comments}
          </span>
          <span className="text-[16px]">
            <b>Answers:</b> {question.answers}
          </span>
          <span className="text-[16px] flex items-center gap-2 flex-row">
            <img
              src={`https://gravatar.com/avatar/${hashedemail}?d=identicon`}
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-bold">Creator:</span> {question.creator} |{" "}
            {levels}
          </span>
          <span className="text-xs text-gray-500">
            {dayjs(question.createdAt).format("M/D/YYYY")} –{" "}
            {dayjs(question.createdAt).fromNow()}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function Buffet() {
  const [sortType, setSortType] = useState<SortType>("recent");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const [isLoggedin, setLoggedIn] = useState(false);
  const lastIdRef = useRef<string | undefined>(undefined);

  const { searchQuery } = useSearch();
  const { setHashedEmails, setLevels, hashedEmail, level} = useUsers();
  const { hashedEmails, levels, loading: usersLoading } = useUserCache();

  useEffect(() => {
    if (!usersLoading) {
      setHashedEmails(hashedEmails);
      console.log("email hashed")
      setLevels(levels);
    }
  }, [usersLoading, hashedEmails, levels]);

  const filteredQuestions = useMemo(() => {
    return searchQuestions(questions, searchQuery);
  }, [questions, searchQuery]);

  const filterForType = (qs: Question[]): Question[] => {
    if (sortType === "interesting") {
      return qs.filter((q) => !q.hasAcceptedAnswer && q.answers === 0);
    } else if (sortType === "hot") {
      return qs.filter((q) => !q.hasAcceptedAnswer);
    }
    return qs;
  };

  const fetchInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      setQuestions([]);
      setHasMore(true);
      setError(null);
      lastIdRef.current = undefined;

      const sortParam = sortMap[sortType];
      const initial = await fetchQuestions(sortParam);
      const filtered = filterForType(initial);

      setQuestions(filtered);
      lastIdRef.current = initial.at(-1)?.question_id;

      if (filtered.length >= MAX_MATCHED || initial.length < 100) {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [sortType]);

  const fetchMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !lastIdRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const sortParam = sortMap[sortType];
      const next = await fetchQuestions(sortParam, lastIdRef.current);
      lastIdRef.current = next.at(-1)?.question_id;

      const filtered = filterForType(next);
      setQuestions((prev) => {
        const merged = [...prev, ...filtered];
        if (merged.length >= MAX_MATCHED || next.length < 100)
          setHasMore(false);
        return merged;
      });
    } catch (err: any) {
      setError(err);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [sortType, hasMore]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        fetchMore();
      }
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, isLoading]);

  useEffect(() => {
    const localUser = getUserLocal();
    if (localUser) setLoggedIn(true);
  }, []);

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
      transition={{ duration: 0.75 }}
      className="pt-16 p-4 sm:p-6 max-w-screen-xl mx-auto space-y-6 bg-gray-50 rounded-xl shadow-md mt-20"
    >
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

      <div className="flex flex-wrap gap-4 justify-start">
        {filteredQuestions.length === 0 ? (
          <div className="text-center text-gray-500 w-full">
            No questions found.
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <QuestionCard
              key={q.question_id}
              question={q}
              hashedemail={hashedEmail[q.creator]}
              levels={level[q.creator]}
            />
          ))
        )}
      </div>

      {isLoading && (
        <div className="text-center text-gray-500 mt-4">Loading more...</div>
      )}
      <div ref={observerRef} className="h-10" />
    </motion.div>
  );
}
