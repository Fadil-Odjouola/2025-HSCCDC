import { useParams } from "react-router-dom";
import {
  getQAanswers,
  getQAquestion,
  getQAcomments,
  createAnswer,
} from "./backendQA";
import React, { useState, useEffect } from "react";
import type { Question } from "@/types/questions";
import { motion } from "framer-motion";
import { getuserobj } from "../auth/signup/backendauth";
import level from "@/api/levelSys";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MarkdownRenderer from "./markdown";
import { PaginatedAnswers } from "./paginated";
import PaginatedComments from "./paginatedComments";
import { getUserLocal } from "@/components/backendUserLocal";
import { useUser } from "@/context/UserContext";
import { updatePoints } from "@/api/changepoints";

dayjs.extend(relativeTime);
const apikey = "1ded7eb6-ab91-47f7-9cf7-7d1319a32e18";

type MailSentMessageProps = {
  duration?: number;
  onFadeOut?: () => void;
  message: string;
};

interface Comment {
  comment_id: number;
  text: string;
  creator: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

const MailSentMessage: React.FC<MailSentMessageProps> = ({
  duration = 3000,
  onFadeOut,
  message,
}) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFadeOut) onFadeOut();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFadeOut]);

  return (
    <div
      className={`
        fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg
        shadow-lg select-none z-50
        transition-opacity duration-1000 ease-in-out
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {message}
    </div>
  );
};

async function getLevel(username: string) {
  const user = await getuserobj(username, apikey);
  const result: number = level(user.user.points);
  return result;
}

export default function QA() {
  const [newAnswer, setNewAnswer] = useState("");
  const [newComment, setNewComment] = useState("");
  const [creatorLevel, setCreatorLevel] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isErrorComments, setIsErrorComments] = useState(false);
  const [isErrorQuestion, SetIsErrorQuestoin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [localUsername, setLocalUsername] = useState("");
  const { user, updateUser } = useUser();
  const [answerError, setanswerError] = useState({
    showmessage: false,
    showError: false,
    message: "",
  });
  const { questionid } = useParams<string>();
  const [question, setQuestoin] = useState<Question>({
    creator: "",
    title: "",
    createdAt: 0,
    text: "",
    status: "",
    hasAcceptedAnswer: false,
    upvotes: 0,
    downvotes: 0,
    answers: 0,
    views: 0,
    comments: 0,
    question_id: "",
    acceptedAnswerId: false,
  });

  const [answers, setanswers] = useState([]);
  const [comments, setComments] = useState([]);

  const handleAddAnswer = async () => {
    if (newAnswer.length <= 3000) {
      const result = await createAnswer(
        questionid,
        localUsername,
        newAnswer,
        apikey
      );
      if (result.success) {
        console.log(result);
        setNewAnswer("");
        setanswerError({
          showError: false,
          showmessage: true,
          message: "Answer created succesfully",
        });
        if (!user?.points) return;
        updateUser({ points: user.points + 2 });
        updatePoints(user.username, "increment", 2);
      } else {
        setanswerError({
          showError: true,
          showmessage: false,
          message: `Error ${result.error}`,
        });
      }
    }
  };

  const handleAddComment = () => {
    if (newComment.length <= 150) {
      // call API to add comment
      setNewComment("");
    }
  };

  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      if (!questionid) return;
      // First: fetch question (no loading/error state here)
      const result = await getQAquestion(questionid, apikey);
      SetIsErrorQuestoin(false);
      if (result.success) {
        SetIsErrorQuestoin(false);
        setQuestoin({
          creator: result.question.creator,
          title: result.question.title,
          createdAt: result.question.createdAt,
          text: result.question.text,
          status: result.question.status,
          hasAcceptedAnswer: result.question.hasAcceptedAnswer,
          upvotes: result.question.upvotes,
          downvotes: result.question.downvotes,
          answers: result.question.answers,
          views: result.question.views,
          comments: result.question.comments,
          question_id: result.question.question_id,
          acceptedAnswerId: result.question.acceptedAnswerId,
        });
      } else {
        setIsError(true);
        console.log(result.error);
      }

      // Then: fetch answers (with loading and error)
      setIsLoading(true);
      setIsError(false);

      const result2 = await getQAanswers(questionid, apikey);
      if (result2.success) {
        setanswers(result2.answers);
        setIsLoading(false);
      } else {
        setIsError(true);
        console.log(result2.error);
      }

      setIsLoadingComments(true);
      setIsErrorComments(false);
      try {
        const result3 = await getQAcomments(questionid, apikey);
        if (result3.success) {
          setComments(result3.comments);
        } else {
          setIsError(true);
        }
      } catch (err) {
        console.log(err);
        setIsError(true);
      } finally {
        setIsLoadingComments(false);
      }
      const localuser = await getUserLocal();
      if (!localuser?.username) return;
      setLocalUsername(localuser.username);
    };

    fetchQuestionsAndAnswers();
  }, []);

  useEffect(() => {
    const creator = async () => {
      if (!question?.creator) return;
      const result = await getLevel(question.creator);
      setCreatorLevel(result);
    };
    creator();
  }, [question.creator]); // ✅ fix

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 mt-20 ">
      <div className="border rounded-lg p-4 shadow-md">
        <div>
          {" "}
          {isErrorQuestion ? (
            <div className=" p-6 max-w-3xl mx-auto bg-red-50 rounded-xl shadow-sm text-center text-red-600 mb-2">
              Error loading questions
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{question.title}</h1>
                <div className="text-sm text-gray-500">
                  <span className="text-[15px] text-gray-500 font-semibold mr-1">
                    Asked:
                  </span>
                  {dayjs(question.createdAt).format("M/D/YYYY")} -{" "}
                  {dayjs(question.createdAt).fromNow()}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-[15px] text-gray-500 font-semibold">
                  Views:
                </span>
                {question.views} |
                <span className=" ml-1 text-[15px] text-gray-500 font-semibold">
                  Points:
                </span>
                {question.upvotes - question.downvotes}
              </div>
              <div className="flex items-center mt-2 gap-2">
                <img
                  src={question.creator}
                  alt={question.creator}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">
                  <span className="mr-1 text-[15px] text-gray-500 font-semibold">
                    Creator:
                  </span>
                  {question.creator} |{" "}
                  <span className="mr-1 text-[15px] text-gray-500 font-semibold">
                    level:
                  </span>{" "}
                  {creatorLevel}
                </span>
              </div>
            </>
          )}
        </div>
        <div>
          <MarkdownRenderer body={question.text} />
        </div>
        <h2 className="text-lg font-semibold mt-2: mb-1">Answers: </h2>
        <div>
          {answers.length > 0 ? (
            <PaginatedAnswers
              answers={answers}
              isError={isError}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center  text-gray-500">No Answers yet.</div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex flex-row items-center justify-between gap-5 h-max">
            <textarea
              placeholder="Add a new answer (Max 3,000 char)"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              maxLength={3000}
              className="w-full p-2 border rounded"
            />
            <div className="flex items-center justify-center  flex-col -translate-y-3">
              <h1 className="text-lg font-semibold">Preview</h1>
              <div className="w-[400px] border h-[65px] rounded p-1 ">
                <MarkdownRenderer body={newAnswer} />
              </div>
            </div>
          </div>
        </div>
        {answerError.showError && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-red-50 border border-red-400 text-red-700 text-center shadow transition-all duration-300 mb-5">
            hello
            {answerError.message}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleAddAnswer}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit Answer
          </button>
        </div>
      </div>
      {answerError.showmessage && (
        <MailSentMessage message={answerError.message} />
      )}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Comments: </h2>
        <div>
          <PaginatedComments
            comments={comments}
            isError={isErrorComments}
            isLoading={isLoadingComments}
          />
        </div>
        <div className="mt-6">
          <div className="mt-4 space-y-2">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={150}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-blue-600 text-white rounded mt-1"
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
