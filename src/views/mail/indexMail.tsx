import React, { useState, useEffect } from "react";
import { sendmail, getmail } from "./backendMail";
import { getUserLocal } from "@/components/backend";

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
    <div className="border rounded-lg p-4 shadow-sm">
      <h4 className="text-xl font-semibold truncate">{message.subject}</h4>
      <p className="text-sm text-gray-500">From: {message.sender}</p>
      <p className="mt-2 text-gray-700">{message.text}</p>
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
    const fetchdata = async () => {
      if (!mail.sender) return;
      const result = await getmail(mail.sender, apikey)
      console.log(result)
      setMessages(result.messages)
    }

    fetchdata()
  }, [mail.sender])
  const handleSend = async () => {
    const result = await sendmail(mail, apikey);
    console.log(result);
    setShowForm(false);
    setShowMessage(true)
    Setmail({
    sender: "",
    receiver: "",
    subject: "",
    text: "",
  });
  };
  return (
    <div className="p-4 max-w-3xl mx-auto mt-25">
      <div className="flex justify-between items-center pb-2 ">
        <h2 className="text-2xl font-bold">Inbox</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-all duration-300"
        >
          {showForm ? "Close Form" : "Create a new Mail"}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out  ${
          showForm
            ? "max-h-[1000px] opacity-100 scale-100 mb-3"
            : "max-h-0 opacity-0 scale-95"
        } border rounded-lg p-4 shadow-md`}
      >
        <h3 className="text-lg font-semibold mb-2">New Question</h3>
        <input
          type="text"
          placeholder="Title (max 75 chars)"
          maxLength={75}
          value={mail.subject}
          onChange={(e) => Setmail({ ...mail, subject: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Recipient Username"
          value={mail.receiver}
          onChange={(e) => Setmail({ ...mail, receiver: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />
        <textarea
          placeholder="Message (max 150 chars)"
          maxLength={150}
          value={mail.text}
          onChange={(e) => Setmail({ ...mail, text: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        ></textarea>
        <button
          onClick={handleSend}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Send
        </button>
      </div>
              {
          showMessage && (
            <MailSentMessage duration={2500} onFadeOut={() => {setShowMessage(false)}}/>
          )
        }
      <div className="grid gap-4">
        {messages.map((msg) => (
          <MessageCard key={msg.mail_id} message={msg} />
        ))}
      </div>
    </div>
  );
};

export default Mail;
