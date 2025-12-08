"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, User, Sparkles, MessageSquare, Menu, X, Plus, GripVertical, Trash2, LogOut, UserCircle } from "lucide-react";
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
  const { data: session, isPending, refetch } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Handle sidebar resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 250 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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
        groupMessagesBySessions(data);
        // Don't automatically load messages - start with empty state
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupMessagesBySessions = (allMessages: Message[]) => {
    // Group messages by conversation threads (detect gaps of more than 1 hour)
    const sessions: ChatSession[] = [];
    let currentSession: Message[] = [];
    let lastTimestamp: Date | null = null;

    allMessages.forEach((msg) => {
      const msgTime = new Date(msg.createdAt);
      
      if (lastTimestamp && (msgTime.getTime() - lastTimestamp.getTime()) > 3600000) {
        // More than 1 hour gap - new session
        if (currentSession.length > 0) {
          sessions.push(createSessionFromMessages(currentSession));
          currentSession = [];
        }
      }
      
      currentSession.push(msg);
      lastTimestamp = msgTime;
    });

    if (currentSession.length > 0) {
      sessions.push(createSessionFromMessages(currentSession));
    }

    setChatSessions(sessions.reverse());
  };

  const createSessionFromMessages = (msgs: Message[]): ChatSession => {
    const firstMsg = msgs[0];
    const userMsg = msgs.find(m => m.role === "user");
    return {
      date: new Date(firstMsg.createdAt).toLocaleDateString(),
      messages: msgs,
      preview: userMsg?.message.substring(0, 60) + "..." || "New conversation",
      timestamp: firstMsg.createdAt,
    };
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
    toast.success("Started new conversation");
  };

  const deleteSession = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const session = chatSessions[index];
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Delete all messages in this session
      for (const msg of session.messages) {
        await fetch(`/api/chat-history/${msg.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      toast.success("Conversation deleted");
      
      // Refresh messages
      await fetchMessages();
      
      // Clear current view if this was the active session
      if (activeSessionIndex === index) {
        setMessages([]);
        setActiveSessionIndex(null);
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // If starting a new chat, mark it as a new session
    const isNewSession = messages.length === 0;

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
          "That must be challenging for you. It's important to acknowledge these feelings rather than suppress them. Have you considered journaling or meditation?",
          "Your awareness of your emotional state is commendable. What coping strategies have worked for you in the past?",
          "I appreciate you opening up to me. Remember, seeking support is a sign of strength, not weakness. How are you taking care of yourself today?",
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
          
          // Refresh sidebar to show new session
          if (isNewSession) {
            await fetchMessages();
            toast.success("New conversation started!");
          }
        }
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");
    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
      router.push("/");
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
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="flex-1 pt-16 flex overflow-hidden">
        {/* Resizable Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              ref={sidebarRef}
              initial={{ x: -sidebarWidth, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -sidebarWidth, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ width: sidebarWidth }}
              className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
            >
              <div className="h-full flex flex-col">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Chat History
                      </h2>
                    </div>
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
                  >
                    <Button
                      onClick={startNewChat}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </motion.div>
                </div>

                {/* Chat Sessions List */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-2 pr-2">
                    {chatSessions.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No conversations yet
                        </p>
                      </div>
                    ) : (
                      chatSessions.map((chatSession, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 px-2">
                            {getRelativeDate(chatSession.timestamp)}
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative"
                          >
                            <button
                              onClick={() => loadSession(index)}
                              className={`w-full text-left p-3 rounded-lg transition-all ${
                                activeSessionIndex === index
                                  ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                                  : "bg-white/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <MessageSquare className={`h-4 w-4 mt-1 flex-shrink-0 ${
                                  activeSessionIndex === index ? "text-blue-600" : "text-blue-500"
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                    {chatSession.preview}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {chatSession.messages.length} messages
                                  </p>
                                </div>
                              </div>
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => deleteSession(index, e)}
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Profile & Logout Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center space-x-3 mb-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      <UserCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Resize Handle */}
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors group"
                onMouseDown={() => setIsResizing(true)}
              >
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-12 flex items-center justify-center">
                  <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                </div>
              </div>
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
                      {activeSessionIndex !== null ? "Continue your conversation" : "Share your thoughts and feelings"}
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
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col shadow-xl">
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
                          {activeSessionIndex !== null ? "Load a Conversation" : "Start a New Conversation"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                          {activeSessionIndex !== null 
                            ? "Select a conversation from the sidebar or start a new one."
                            : "Your AI companion is here to listen and support you. Share anything on your mind."
                          }
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
                              className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
                                message.role === "user"
                                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.message}
                              </p>
                              <p className={`text-xs mt-2 ${
                                message.role === "user" 
                                  ? "text-blue-100" 
                                  : "text-gray-500 dark:text-gray-400"
                              }`}>
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-800/50">
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
                      className="min-h-[60px] resize-none bg-white dark:bg-gray-800"
                      disabled={isSending}
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isSending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 self-end h-[60px] px-6"
                      >
                        {isSending ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
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