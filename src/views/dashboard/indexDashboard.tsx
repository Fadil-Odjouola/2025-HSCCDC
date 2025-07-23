import React, { useState, useEffect } from "react";
import type UserLocal from "@/types/userlocal";
import updateUserStorageField, {
  getUserLocal,
} from "@/components/backendUserLocal";
import {
  getquestions,
  getanswers,
  updateEmail,
  updatepassword,
  deleteAccount
} from "./backendDashboard";


const apikey = "1ded7eb6-ab91-47f7-9cf7-7d1319a32e18";

type MailSentMessageProps = {
  duration?: number;
  onFadeOut?: () => void;
  message: string;
};

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

const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style: string;
}) => (
  <div className={`bg-white rounded-2xl shadow p-4 ${style}`}>{children}</div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4">{children}</div>
);

const Dashboard = () => {
  const [user, setUser] = useState<UserLocal>({
    user_id: "",
    salt: "",
    key: "",
    username: "",
    email: "",
    points: 1,
    level: 1,
    pfp: "",
  });
  const [showMessage, SetShowMessage] = useState(false);
  const [showMessage2, SetShowMessage2] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const getStrength = (pwd: string) => {
    if (pwd.length > 17) return "strong";
    if (pwd.length >= 11) return "moderate";
    if (pwd.length > 0) return "weak";
    return "";
  };

  const [questions, setquestoins] = useState([
    { id: 1, title: "How do I use React Hooks?", votes: 12 },
    { id: 2, title: "What's new in Next.js 14?", votes: 8 },
  ]);

  const [answers, setAnswers] = useState([
    {
      id: 1,
      questionId: 1,
      preview: "You can use useState and useEffect...",
      votes: 5,
    },
    {
      id: 2,
      questionId: 2,
      preview: "Next.js 14 introduces new app routing...",
      votes: 3,
    },
  ]);

  const strength = getStrength(password);
  const strengthStyle =
    {
      weak: "text-red-600",
      moderate: "text-yellow-600",
      strong: "text-green-600",
    }[strength as "weak" | "moderate" | "strong"] || "text-gray-500";

  const onUpdateEmail = async (newEmail: string) => {
    const result = await updateEmail(user.username, newEmail, apikey);
    SetShowMessage(true);

    updateUserStorageField("email", newEmail);

    setUser((prev) => ({
      ...prev,
      email: newEmail,
    }));
    setEmail("")
    console.log(result);
    return result;
  };

  const onUpdatePassword = async (newPassword: string) => {
    if (strength != "weak") {
      const result = await updatepassword(user.username, newPassword, apikey);
      SetShowMessage2(true);
      setUser((prev) => ({
        ...prev,
        password: newPassword,
      }));
      setPassword("")
      console.log(result);
      return result; 
    } else {
      console.log("password is too weak")
    }
  };

  const onDeleteAccount = async () => {
    const result  = await deleteAccount(user.username, apikey)
    console.log("Account Deleted")
    window.location.href = "/"
    localStorage.clear()
    sessionStorage.clear()
    console.log(result)
  };
  useEffect(() => {
    const localUser = getUserLocal();
    if (localUser) {
      console.log(localUser);
      setUser({
        user_id: localUser?.user_id,
        salt: localUser.salt,
        key: localUser.key,
        username: localUser.username,
        email: localUser.email,
        points: localUser.points,
        level: localUser.level,
        pfp: "",
      });
    }
  }, []);

  useEffect(() => {
    if (!user.username) return;
    const fetchQuestions = async () => {
      console.log(user.username);
      const result = await getquestions(user.username, apikey);
      const answersResult = await getanswers(user.username, apikey);
      setquestoins([...questions, ...result.questions]);
      setAnswers([...answers, ...answersResult.answers]);
      console.log(result);
    };
    fetchQuestions();
  }, [user.username]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pt-20">
      <Card style="">
        <CardContent>
          <div className="flex items-center gap-4">
            <img
              src={user.pfp}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card style="">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Your Questions</h3>
          <div className="space-y-2">
            {questions.length > 0 ? (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center transition-all duration-250 ease-linear"
                  onClick={() => (window.location.href = `/qa/${q.id}`)}
                >
                  <span className="text-[17px]">{q.title}</span>
                  <span className="text-sm text-gray-500">
                    Votes: {q.votes}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                You have not asked any questions yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card style="">
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">Your Answers</h3>
          <div className="space-y-2">
            {answers.length > 0 ? (
              answers.map((a) => (
                <div
                  key={a.id}
                  className="p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center duration-250 ease-linear"
                  onClick={() => (window.location.href = `/qa/${a.questionId}`)}
                >
                  <span className="text-[17px]">{a.preview}</span>
                  <span className="text-sm text-gray-500">
                    Votes: {a.votes}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                You have not answered any questions yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card style="">
        <CardContent>
          <h3 className="text-lg font-semibold">Account Settings</h3>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Change Email
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-300 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg p-3 flex-1"
              />
              <button
                onClick={() => onUpdateEmail(email)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-300"
              >
                Update
              </button>
            </div>
          </div>
          {showMessage && (
            <MailSentMessage
              duration={2500}
              onFadeOut={() => SetShowMessage(false)}
              message="Email updated succesfully"
            />
          )}
          <div className="mt-4 flex flex-col ">
            <label className="block text-sm font-medium mb-1">
              Change Password
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`transition-all duration-300 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg p-3 flex-1 ${
                  strength === "weak"
                    ? "border-red-100"
                    : strength === "moderate"
                    ? "border-yellow-500"
                    : strength === "strong"
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
              />
              <button
                onClick={() => onUpdatePassword(password)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-300"
              >
                Update
              </button>
            </div>
            {strength && (
              <span
                className={` translate-y-2 text-sm font-medium w-max h-max p-3 border-2 transition-all duration-300 rounded-2xl  ${strengthStyle} `}
              >
                {strength === "weak" &&
                  "Weak password (must be > 10 characters), WON'T BE ACCEPTED"}
                {strength === "moderate" && "Moderate password"}
                {strength === "strong" && "Strong password"}
              </span>
            )}
          </div>
          {showMessage2 && (
            <MailSentMessage
              duration={2500}
              onFadeOut={() => SetShowMessage2(false)}
              message="Password updated succesfully"
            />
          )}
          <div className="mt-4">
            <button
              onClick={onDeleteAccount}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all duration-300 "
            >
              Delete Account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
