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
import { CheckIcon } from "lucide-react";
import { getanswers, getquestions } from "../dashboard/backendDashboard";
import { useBadges } from "@/context/badgesContext";
import { apikey } from "@/api/apikey";
import type { Tag } from "@/types/local";

type SortType = "recent" | "best" | "interesting" | "hot";

const sortMap: Record<Exclude<SortType, "recent">, "u" | "uvc" | "uvac"> = {
  best: "u",
  interesting: "uvc",
  hot: "uvac",
};

function QuestionCard({
  question,
  hashedemail,
  levels,
}: {
  question: Question;
  hashedemail?: string;
  levels?: number;
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
        <div className="text-lg sm:text-xl font-semibold mb-1 text-gray-800 flex flex-row items-center justify-between ">
          {question.title}{" "}
          <CheckIcon
            className={`w-max h-max p-2 text-lg ${
              question.hasAcceptedAnswer ? `bg-green-500` : `bg-gray-500`
            } text-white rounded-2xl`}
          ></CheckIcon>
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
            {levels ?? "N/A"}
          </span>
          <span className="text-xs text-gray-500">
            {dayjs(question.createdAt).format("M/D/YYYY")} –{" "}
            {dayjs(question.createdAt).fromNow()}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              const link = `${window.location.origin}/question/${question.question_id}`;
              navigator.clipboard
                .writeText(link)
                .then(() => alert("Link copied to clipboard!"))
                .catch(() => alert("Failed to copy link"));
            }}
            className=" hover:underline text-sm w-max h-max p-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-800 transition-all duration-300 ease-linear"
          >
            Share
          </button>
        </div>
      </div>
    </motion.a>
  );
}

export default function Buffet() {
  const [sortType, setSortType] = useState<SortType>("recent");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [show, setShow] = useState(false);
  const [isLoggedin, setLoggedIn] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { searchQuery } = useSearch();
  const { user } = useUser();
  const { badges, setBadges } = useBadges();
  const { hashedEmails, levels, loading: usersLoading } = useUserCache();

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const filteredQuestions = useMemo(() => {
    return searchQuestions(questions, searchQuery);
  }, [questions, searchQuery]);

  const toggleSubBadgeCompletion = useCallback(
    (categoryName: string, subBadgeTitle: string, isCompleted: boolean) => {
      setBadges((currentBadges) => {
        const newBadges = { ...currentBadges };
        const categoryToUpdate = newBadges[categoryName];
        if (!categoryToUpdate) return currentBadges;

        const newCategory = { ...categoryToUpdate };
        const subBadgeToUpdate = newCategory.subbadges[subBadgeTitle];
        if (!subBadgeToUpdate || subBadgeToUpdate.completed === isCompleted) {
          return currentBadges;
        }

        newCategory.subbadges = {
          ...newCategory.subbadges,
          [subBadgeTitle]: {
            ...subBadgeToUpdate,
            completed: isCompleted,
          },
        };

        newBadges[categoryName] = newCategory;
        return newBadges;
      });
    },
    [setBadges]
  );

  useEffect(() => {
    if (!user?.username) return;
    const fetchQuestions = async () => {
      const result = await getquestions(user.username, apikey);
      const answersResult = await getanswers(user.username, apikey);
      result.questions.map((question: any) => {
        const netTotal = question.upvotes - question.downvotes;
        if (netTotal >= 100) {
          toggleSubBadgeCompletion("Gold", "Great Question", true);
        } else if (netTotal >= 25) {
          toggleSubBadgeCompletion("Silver", "Good Question", true);
        } else if (netTotal >= 10) {
          toggleSubBadgeCompletion("Bronze", "Nice Question", true);
        }
      });
    };
    fetchQuestions();
  }, [user?.username]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const param = sortType === "recent" ? "d" : sortMap[sortType];
      const response = await fetchQuestions(param, afterCursor);
      console.log(response);

      if (response.length === 0) {
        setHasMore(false);
      } else {
        setQuestions((prev) => [...prev, ...response]);
        setAfterCursor(response[response.length - 1].question_id);
      }
    } catch (error: any) {
      setError(error.message || "Failed to load more questions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setQuestions([]);
    setAfterCursor(undefined);
    setHasMore(true);
    fetchMore();
  }, [sortType]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchMore();
      },
      { threshold: 1.0 }
    );

    observer.current.observe(loaderRef.current);

    return () => observer.current?.disconnect();
  }, [loaderRef.current, hasMore, isLoading]);

  useEffect(() => {
    const localUser = getUserLocal();
    if (localUser) setLoggedIn(true);
  }, []);

  if (isLoading && questions.length === 0) {
    return (
      <div className="pt-16 p-6 max-w-3xl mx-auto bg-gray-50 rounded-xl shadow-sm mt-20 text-center text-gray-700">
        Loading questions...
      </div>
    );
  }

  if (error && questions.length === 0) {
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
          filteredQuestions.map((q, index) => (
            <QuestionCard
              key={index}
              question={q}
              hashedemail={hashedEmails?.[q.creator]}
              levels={levels?.[q.creator]}
            />
          ))
        )}
      </div>

      <div ref={loaderRef} className="text-center text-gray-500 py-4">
        {isLoading && "Loading more..."}
        {!hasMore && "No more questions"}
      </div>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 transition"
        >
          Back to Top ↑
        </button>
      )}
    </motion.div>
  );
}
