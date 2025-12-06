"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, User, Sparkles, MessageSquare, Menu, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: number;
  message: string;
  role: "user" | "assistant";
  createdAt: string;
}

interface ChatSession {
  date: string;
  messages: Message[];
  preview: string;
  timestamp: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
    }
  }, [session]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/chat-history?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllMessages(data);
        setMessages(data);
        groupMessagesBySessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupMessagesBySessions = (allMessages: Message[]) => {
    const sessions: { [key: string]: Message[] } = {};
    
    allMessages.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      if (!sessions[date]) {
        sessions[date] = [];
      }
      sessions[date].push(msg);
    });

    const sessionArray: ChatSession[] = Object.entries(sessions).map(([date, msgs]) => ({
      date,
      messages: msgs,
      preview: msgs.find(m => m.role === "user")?.message.substring(0, 50) + "..." || "New conversation",
      timestamp: msgs[0]?.createdAt || "",
    }));

    setChatSessions(sessionArray.reverse());
  };

  const loadSession = (index: number) => {
    setActiveSessionIndex(index);
    setMessages(chatSessions[index].messages);
    scrollToBottom();
  };

  const startNewChat = () => {
    setActiveSessionIndex(null);
    setMessages([]);
    setInput("");
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    try {
      const token = localStorage.getItem("bearer_token");
      
      // Add user message
      const userResponse = await fetch("/api/chat-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          role: "user",
        }),
      });

      if (userResponse.ok) {
        const newUserMessage = await userResponse.json();
        setMessages((prev) => [...prev, newUserMessage]);

        // Simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const aiResponses = [
          "I understand how you're feeling. It's completely normal to experience these emotions. Would you like to talk more about what's on your mind?",
          "Thank you for sharing that with me. Remember, taking care of your mental health is a journey, and every step counts. How can I support you today?",
          "That's a great insight! Recognizing your feelings is an important part of mindfulness. Have you tried any breathing exercises today?",
          "I'm here to listen and support you. Your feelings are valid, and it's okay to take things one day at a time. What would help you feel better right now?",
          "It sounds like you're making progress. Remember to be kind to yourself - healing isn't always linear. Would you like some suggestions for self-care activities?",
        ];

        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

        const aiResponse = await fetch("/api/chat-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: randomResponse,
            role: "assistant",
          }),
        });

        if (aiResponse.ok) {
          const newAiMessage = await aiResponse.json();
          setMessages((prev) => [...prev, newAiMessage]);
          fetchMessages(); // Refresh to update sidebar
        }
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <main className="flex-1 pt-16 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-20 w-full mb-6" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="flex-1 pt-16 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-72 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat History
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* New Chat Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4"
              >
                <Button
                  onClick={startNewChat}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </motion.div>

              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-2">
                  {chatSessions.map((session, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 px-2">
                        {getRelativeDate(session.date)}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadSession(index)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          activeSessionIndex === index
                            ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <MessageSquare className={`h-4 w-4 mt-1 flex-shrink-0 ${
                            activeSessionIndex === index ? "text-blue-600" : "text-blue-500"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {session.preview}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {session.messages.length} messages
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col px-4 py-8">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {!sidebarOpen && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  )}
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        AI Chat Companion
                      </span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Share your thoughts and feelings
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 flex flex-col"
            >
              <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col">
                {/* Messages Area */}
                <ScrollArea
                  ref={scrollRef}
                  className="flex-1 p-6"
                >
                  <AnimatePresence mode="wait">
                    {messages.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="h-full flex flex-col items-center justify-center text-center"
                      >
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          className="p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4"
                        >
                          <Sparkles className="h-12 w-12 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Start a Conversation
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                          Your AI companion is here to listen and support you. Share
                          anything on your mind.
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="messages"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        {messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-start space-x-3 ${
                              message.role === "user" ? "justify-end" : ""
                            }`}
                          >
                            {message.role === "assistant" && (
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                              >
                                <Bot className="h-5 w-5 text-white" />
                              </motion.div>
                            )}

                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              className={`max-w-[75%] p-4 rounded-2xl ${
                                message.role === "user"
                                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.message}
                              </p>
                            </motion.div>

                            {message.role === "user" && (
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center"
                              >
                                <User className="h-5 w-5 text-white" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/30 dark:bg-gray-800/30">
                  <div className="flex space-x-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your message... (Press Enter to send)"
                      className="min-h-[60px] resize-none"
                      disabled={isSending}
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isSending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}