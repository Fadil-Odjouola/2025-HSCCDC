import React, { useState, useEffect } from "react";
import { sendmail, getmail } from "./backendMail";
import { getUserLocal } from "@/components/backendUserLocal";
import { useUser } from "@/context/UserContext";
import { MailsIcon } from "lucide-react";

interface Message {
  mail_id: number;
  subject: string;
  sender: string;
  text: string;
}

interface NewMail {
  sender: string | undefined;
  receiver: string;
  subject: string;
  text: string;
}

type MailSentMessageProps = {
  duration?: number;
  onFadeOut?: () => void;
};

const apikey = "1ded7eb6-ab91-47f7-9cf7-7d1319a32e18";






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
  const { user } = useUser();

  const [readMessageIds, setReadMessageIds] = useState<string[]>([]);

  const [mail, Setmail] = useState<NewMail>({
    sender: user?.username,
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
    const storedReadMessages = localStorage.getItem('currentUserReadMessages');
    if (storedReadMessages) {
      try {
        const parsedIds: string[] = JSON.parse(storedReadMessages);
        setReadMessageIds(parsedIds);
      } catch (e) {
        console.error("Failed to parse read messages from localStorage:", e);
        // Fallback to empty array if parsing fails
        setReadMessageIds([]);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!mail.sender) return;
      setLoading(true);
      setError(null);
      try {
        const result = await getmail(mail.sender, apikey);
        if (result.success) {
          setMessages(result.messages);
          SetBigError(false);
        }
      } catch (err) {
        console.error(err);
        SetBigError(true);
        setError("Failed to load messages. Please try again later.");
        setLoading(false)
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


  // 
  const markMessageAsRead = (messageId: string) => {
    setReadMessageIds(prevReadIds => {
      // Ensure we don't add duplicates
      if (!prevReadIds.includes(messageId)) {
        const updatedIds = [...prevReadIds, messageId];
        localStorage.setItem('currentUserReadMessages', JSON.stringify(updatedIds));
        return updatedIds;
      }
      return prevReadIds; // If already includes, return current state without change
    });
  };


  // Checks User in localstorage
  useEffect(() => {
    // Get the ID of the user currently logged in
    const currentUserId = user?.user_id; // Assuming `user` object from `useUser()` has an `id` property

    // Get the ID of the user whose data is currently in localStorage
    const storedUserId = localStorage.getItem('currentUserId');

    // Get the read messages from localStorage
    const storedReadMessages = localStorage.getItem('currentUserReadMessages');

    if (currentUserId) {
      // If there's a logged-in user:
      localStorage.setItem('currentUserId', currentUserId); // Always update or set the current user ID in localStorage

      if (storedUserId === currentUserId) {
        // Case 1: Stored user matches current user
        // Load their read messages
        if (storedReadMessages) {
          try {
            const parsedIds: string[] = JSON.parse(storedReadMessages);
            setReadMessageIds(parsedIds);
          } catch (e) {
            console.error("Failed to parse read messages from localStorage:", e);
            setReadMessageIds([]); // Fallback to empty if corrupted
            localStorage.removeItem('currentUserReadMessages'); // Clear corrupted data
          }
        } else {
          setReadMessageIds([]); // No stored messages for this user yet
        }
      } else {
        // Case 2: Stored user DOES NOT match current user (or no stored user)
        // This means a different user logged in, or it's the first time for this user.
        // CLEAR any old read message data for security/correctness.
        console.log(`User changed from ${storedUserId} to ${currentUserId}. Clearing old read messages.`);
        localStorage.removeItem('currentUserReadMessages');
        setReadMessageIds([]); // Reset state to empty
      }
    } else {
      // Case 3: No user is logged in (currentUserId is null/undefined)
      // Clear all user-specific local storage data.
      console.log("No user logged in. Clearing all user-specific localStorage.");
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('currentUserReadMessages');
      setReadMessageIds([]); // Reset state to empty
    }
  }, [user?.user_id]);


  const MessageCard = ({ message }: { message: Message }) => {
    return (
      <div className="border rounded-lg p-4 shadow-sm bg-white w-full break-words">
        <div className="mb-1 text-gray-800 flex flex-row items-center justify-between">
          <h4 className="text-lg sm:text-xl font-semibold truncate">
            {message.subject}
          </h4>
          <MailsIcon
            className={`w-max h-max p-2 text-lg ${readMessageIds.includes(String(message.mail_id)) ? 'bg-green-500' : ''
              }`}
            onClick={() => {
              const stored = JSON.parse(localStorage.getItem('currentUserReadMessages') || '[]');
              if (!stored.includes(String(message.mail_id))) {
                const updated = [...stored, String(message.mail_id)];
                localStorage.setItem('currentUserReadMessages', JSON.stringify(updated));
              }
            }}
          />
        </div>
        <p className="text-sm text-gray-500 truncate">From: {message.sender}</p>
        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{message.text}</p>
      </div>
    );
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
        className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm
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

      {/* Messages */}
      {bigerror ? (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
          yes
        </div>
      ) : (
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
