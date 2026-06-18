import { useState, useRef, useEffect } from "react";
import {
  Send,
  Menu,
  Paperclip,
  Mic,
  Clock,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import axios from "axios"

function CorporateNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 bg-[rgba(10,15,30,0.85)] backdrop-blur-md border-b border-sky-400/15">
      <div className="flex items-center gap-2.5 text-xl font-bold text-slate-50 tracking-tight">
        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-sky-400 to-indigo-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
        IdeaLab AI
      </div>
      <div className="flex items-center gap-6">
        {["Docs", "Pricing", "Blog"].map((label) => (
          <button
            key={label}
            className="text-sm text-slate-400 hover:text-sky-400 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            {label}
          </button>
        ))}
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 transition-opacity cursor-pointer border-none">
          Sign In
        </button>
      </div>
    </nav>
  );
}

function CorporateSidebar({ onNewChat, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <>
      <aside className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col gap-2 pt-20 px-6 pb-6 bg-[rgba(10,15,30,0.95)] border-r border-sky-400/15">
        <div className="flex items-center justify-between mb-6">
          <span className="text-base font-bold text-slate-50">IdeaLab AI</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-1.5 rounded-lg bg-sky-400/8 border border-sky-400/20 text-slate-400 hover:text-sky-400 hover:bg-sky-400/15 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full py-2.5 mb-6 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <Plus size={16} />
          New Chat
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Recent Conversations
        </p>
        {["Last session", "Building a to-do app", "React hooks deep dive"].map(
          (item, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-sm text-slate-400 rounded-lg hover:bg-sky-400/8 hover:text-sky-400 transition-colors bg-transparent border-none cursor-pointer"
            >
              {item}
            </button>
          )
        )}
      </aside>
    </>
  );
}

export default function NovaMindApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [architectureText, setArchitectureText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [finalContent,setfinalContent]=useState("")
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const hasStartedChat = messages.length > 0;

  const searchHistory = [
    { id: "1", query: "I want to build a food delivery app", timestamp: "2 hours ago" },
    { id: "2", query: "I want to build a startup", timestamp: "Yesterday" },
    { id: "3", query: "I am thinking to build something", timestamp: "2 days ago" },
    { id: "4", query: "I want to build something useful for kids", timestamp: "3 days ago" },
    { id: "5", query: "I want to build a education platform", timestamp: "1 week ago" },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsGenerating(true);

    try {
      const backendMessages = [
      {
        role: "system",
        content:
          "You are IdeaLab, an AI startup mentor. Ask one relevant question at a time. After collecting enough information, generate a structured product concept.",
      },
      ...updatedMessages.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : msg.role,
        content: msg.content,
      })),
    ]
        const {data} = await axios.post("http://localhost:5000/api/chat", {
            messages: backendMessages,
        });
        if (data.completed){
          setChatCompleted(true)
          const idea = JSON.parse(data.response.response);
          setfinalContent(`
          Product Name
          ${idea.product_name}

          Problem
          ${idea.problem}

          Target Users
          ${idea.target_users.map(user => `• ${user}`).join("\n")}

          Business Model
          ${idea.business_model}

          Features
          ${idea.features.map(feature => `• ${feature}`).join("\n")}
          `);
        }
        if (!data.completed){
          const aimessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: data.response.response,
            timestamp: new Date(),
        };
          setMessages((prev) => [...prev, aimessage]);
        }

    } catch (error) {

        const aimessage = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "Something went wrong. Please try again.",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aimessage]);
        console.log(error);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setArchitectureText("");
    setIsSidebarOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-[#0d1b2a] to-[#0a1628] text-slate-200 font-sans">
      <CorporateNavbar />
      {hasStartedChat && (
        <CorporateSidebar
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="pt-20 h-screen box-border">
        <div className="h-full flex px-8 pb-8 box-border">


          {!hasStartedChat ? (
            <>
              <div className="w-72 flex-shrink-0 pr-6">
                <div className="h-full overflow-y-auto p-6 rounded-xl bg-[rgba(15,23,42,0.7)] border border-sky-400/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-sky-400" />
                    <h3 className="text-[15px] font-semibold text-slate-200 m-0">
                      Recent Searches
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1">
                    {searchHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setInput(item.query)}
                        className="w-full text-left px-3 py-2.5 rounded-lg bg-transparent border-none cursor-pointer hover:bg-sky-400/8 transition-colors group"
                      >
                        <p className="m-0 text-[13px] text-slate-300 group-hover:text-sky-400 transition-colors mb-1">
                          {item.query}
                        </p>
                        <span className="text-[11px] text-slate-600">
                          {item.timestamp}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="w-full max-w-2xl mx-auto">
                  <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-slate-50 tracking-tight leading-tight mb-3">
                      Welcome to{" "}
                      <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                        IdeaLab AI
                      </span>
                    </h1>
                    <p className="text-base text-slate-500 m-0">
                      Turning ideas into impactful products, one conversation at a time.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-[rgba(15,23,42,0.7)] border border-sky-400/10 backdrop-blur-sm">
                    <textarea
                      placeholder="What can I help you with today? Ask me anything..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={4}
                      className="w-full mb-4 px-4 py-3 rounded-lg bg-[rgba(15,23,42,0.6)] border border-sky-400/20 text-slate-200 text-sm placeholder-slate-600 outline-none resize-none box-border transition-colors focus:border-sky-400/50 font-sans"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload file"
                        className="flex items-center justify-center p-2.5 rounded-lg bg-sky-400/8 border border-sky-400/20 text-slate-400 hover:text-sky-400 hover:bg-sky-400/15 transition-colors cursor-pointer"
                      >
                        <Paperclip size={18} />
                      </button>

                      <button
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                        className="flex items-center gap-2 ml-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
                      >
                        <Send size={16} />
                        Send
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex gap-6 overflow-hidden">
              <div className="w-[40%] flex flex-col">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center justify-center self-start p-2.5 mb-3 rounded-lg bg-sky-400/8 border border-sky-400/20 text-slate-400 hover:text-sky-400 hover:bg-sky-400/15 transition-colors cursor-pointer"
                >
                  <Menu size={18} />
                </button>
                <div className="flex-1 overflow-y-auto mb-3 p-6 rounded-xl bg-[rgba(15,23,42,0.7)] border border-sky-400/10 backdrop-blur-sm">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-sky-500 to-indigo-500 text-white rounded-[16px_16px_4px_16px]"
                            : "bg-[rgba(30,41,59,0.8)] border border-sky-400/10 text-slate-200 rounded-[16px_16px_16px_4px]"
                        }`}
                      >
                        <p className="m-0 text-sm leading-relaxed">
                          {msg.content}
                        </p>
                        <span
                          className={`block mt-1.5 text-[11px] opacity-60 
                          ${
                            msg.role === "user" ? "text-sky-100" : "text-slate-400"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start mb-4">
                      <div className="px-4 py-3 rounded-[16px_16px_16px_4px] bg-[rgba(30,41,59,0.8)] border border-sky-400/10">
                        <Loader2 size={20} className="text-sky-400 animate-spin" />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 rounded-xl bg-[rgba(15,23,42,0.7)] border border-sky-400/10 backdrop-blur-sm">
                  <div className="flex items-end gap-2">
                    <textarea
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      className="flex-1 px-4 py-3 rounded-lg bg-[rgba(15,23,42,0.6)] border border-sky-400/20 text-slate-200 text-sm placeholder-slate-600 outline-none resize-none transition-colors focus:border-sky-400/50 font-sans"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || chatCompleted}
                      className="flex items-center justify-center p-3 rounded-lg text-white bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-[60%] flex flex-col">
                <div className="flex-1 flex flex-col overflow-hidden p-6 rounded-xl bg-[rgba(15,23,42,0.7)] border border-sky-400/10 backdrop-blur-sm">
                  <h3 className="m-0 mb-4 text-base font-semibold text-slate-200">
                    Refined Idea Statement
                  </h3>
                  <div className={`flex-1 flex items-center ${!chatCompleted?"justify-center":"justify-start"} rounded-lg bg-[rgba(15,23,42,0.6)] border border-sky-400/20 text-slate-400 text-lg font-mono`}>
                    {!chatCompleted?
                    <>
                    <h1 className="text-6xl font-extrabold text-sky-200 animate-pulse drop-shadow-[0_0_25px_#bae6fd]">IdeaLab</h1>
                    </>:
                    <div className="whitespace-pre-wrap">
                    {finalContent}
                    </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
