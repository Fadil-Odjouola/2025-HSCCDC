import React, { useState, useEffect } from "react";
import { sendmail, getmail } from "./backendMail";
import { getUserLocal } from "@/components/backendUserLocal";

interface Message {
  mail_id: number;
  subject: string;
  sender: string;
  text: string;
}

interface NewMail {
  sender: string;
  receiver: string;
  subject: string;
  text: string;
}

type MailSentMessageProps = {
  duration?: number;
  onFadeOut?: () => void;
};

const apikey = "1ded7eb6-ab91-47f7-9cf7-7d1319a32e18";

const MessageCard = ({ message }: { message: Message }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white w-full break-words">
      <h4 className="text-lg sm:text-xl font-semibold truncate">
        {message.subject}
      </h4>
      <p className="text-sm text-gray-500 truncate">From: {message.sender}</p>
      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{message.text}</p>
    </div>
  );
};

const MailSentMessage: React.FC<MailSentMessageProps> = ({
  duration = 3000,
  onFadeOut,
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
      Mail Sent Successfully!
    </div>
  );
};

const Mail = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bigerror, SetBigError] = useState(false);

  const [mail, Setmail] = useState<NewMail>({
    sender: "",
    receiver: "",
    subject: "",
    text: "",
  });

  useEffect(() => {
    const k = getUserLocal();
    if (k) {
      Setmail((prev) => ({
        ...prev,
        sender: k.username,
      }));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!mail.sender) return;
      setLoading(true);
      setError(null);
      try {
        const result = await getmail(mail.sender, apikey);
        setMessages(result.messages);
        SetBigError(false);
      } catch (err) {
        console.error(err);
        SetBigError(true);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mail.sender]);

  const handleSend = async () => {
    try {
      await sendmail(mail, apikey);
      setShowForm(false);
      setShowMessage(true);
      Setmail({
        sender: mail.sender, // keep sender after sending
        receiver: "",
        subject: "",
        text: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to send mail. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto mt-20 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <h2 className="text-2xl font-bold">Inbox</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 w-full sm:w-auto text-center"
        >
          {showForm ? "Close Form" : "Create a new Mail"}
        </button>
      </div>

      {/* Form */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showForm
            ? "max-h-[1000px] opacity-100 scale-100 mb-6"
            : "max-h-0 opacity-0 scale-95 mb-0"
        } border rounded-lg p-4 shadow-md bg-white`}
      >
        <h3 className="text-lg font-semibold mb-4">New Mail</h3>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            placeholder="Title (max 75 chars)"
            maxLength={75}
            value={mail.subject}
            onChange={(e) => Setmail({ ...mail, subject: e.target.value })}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Recipient Username"
            value={mail.receiver}
            onChange={(e) => Setmail({ ...mail, receiver: e.target.value })}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            placeholder="Message (max 150 chars)"
            maxLength={150}
            value={mail.text}
            onChange={(e) => Setmail({ ...mail, text: e.target.value })}
            className="w-full border p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
          ></textarea>
          <button
            onClick={handleSend}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Send
          </button>
        </div>
      </div>

      {/* Toast */}
      {showMessage && (
        <MailSentMessage
          duration={2500}
          onFadeOut={() => setShowMessage(false)}
        />
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center my-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {/* Messages */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {messages.map((msg) => (
            <MessageCard key={msg.mail_id} message={msg} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Mail;
