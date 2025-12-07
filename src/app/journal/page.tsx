"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit,
  Calendar,
  FileText,
  Sparkles,
  Smile,
  Frown,
  Meh,
  Heart,
  Cloud,
  Zap,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const moods = [
  { id: "happy", label: "Happy", icon: Smile, color: "from-yellow-400 to-orange-500" },
  { id: "sad", label: "Sad", icon: Frown, color: "from-indigo-400 to-purple-600" },
  { id: "calm", label: "Calm", icon: Moon, color: "from-blue-400 to-blue-600" },
  { id: "anxious", label: "Anxious", icon: Cloud, color: "from-gray-400 to-gray-600" },
  { id: "stressed", label: "Stressed", icon: Zap, color: "from-red-400 to-red-600" },
  { id: "peaceful", label: "Peaceful", icon: Heart, color: "from-green-400 to-emerald-600" },
  { id: "energetic", label: "Energetic", icon: Sun, color: "from-amber-400 to-orange-600" },
  { id: "tired", label: "Tired", icon: Meh, color: "from-slate-400 to-slate-600" },
];

const suggestedTags = [
  "Personal Growth",
  "Gratitude",
  "Goals",
  "Reflection",
  "Challenges",
  "Achievements",
  "Relationships",
  "Work",
  "Health",
  "Mindfulness",
];

export default function JournalPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchEntries();
    }
  }, [session, searchQuery]);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const url = searchQuery
        ? `/api/journal-entries?search=${encodeURIComponent(searchQuery)}`
        : "/api/journal-entries?limit=50";
        
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (entry?: JournalEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setTitle(entry.title);
      setContent(entry.content);
    } else {
      setEditingEntry(null);
      setTitle("");
      setContent("");
      setSelectedMood("");
      setSelectedTags([]);
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
    setTitle("");
    setContent("");
    setSelectedMood("");
    setSelectedTags([]);
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag("");
    }
  };

  const saveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const method = editingEntry ? "PUT" : "POST";
      const url = editingEntry
        ? `/api/journal-entries?id=${editingEntry.id}`
        : "/api/journal-entries";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        
        if (editingEntry) {
          setEntries(entries.map((e) => (e.id === savedEntry.id ? savedEntry : e)));
          toast.success("Entry updated!");
        } else {
          setEntries([savedEntry, ...entries]);
          toast.success("Entry created!");
        }
        
        closeDialog();
      }
    } catch (error) {
      toast.error("Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/journal-entries?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEntries(entries.filter((e) => e.id !== id));
        toast.success("Entry deleted");
      }
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <main className="flex-1 pt-16 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-20 w-full mb-6" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const selectedMoodData = moods.find((m) => m.id === selectedMood);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="flex-1 pt-16 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    My Journal
                  </span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Your personal space for reflection and growth
                </p>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => openDialog()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </motion.div>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your journal entries..."
                className="pl-10"
              />
            </motion.div>
          </motion.div>

          {/* Entries Grid */}
          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20"
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
                className="p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-6"
              >
                <BookOpen className="h-16 w-16 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {searchQuery ? "No entries found" : "Start Your Journal"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                {searchQuery
                  ? "Try a different search term"
                  : "Begin your mindfulness journey by creating your first journal entry"}
              </p>
              {!searchQuery && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => openDialog()}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Entry
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ 
                      scale: 1.03,
                      rotateY: 2,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer group h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          className="flex items-center space-x-2"
                        >
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(entry.createdAt)}
                          </span>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 0, x: 0 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex space-x-1 group-hover:opacity-100"
                        >
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(entry)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {entry.title}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 flex-1">
                        {entry.content}
                      </p>

                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(entry)}
                          className="mt-4 w-full text-blue-600 hover:text-blue-700"
                        >
                          Read More →
                        </Button>
                      </motion.div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Entry Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span>{editingEntry ? "Edit Journal Entry" : "New Journal Entry"}</span>
                </DialogTitle>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    autoFocus
                  />
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your mood...">
                        {selectedMoodData && (
                          <div className="flex items-center space-x-2">
                            <selectedMoodData.icon className="h-4 w-4" />
                            <span>{selectedMoodData.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((mood) => (
                        <SelectItem key={mood.id} value={mood.id}>
                          <div className="flex items-center space-x-2">
                            <mood.icon className="h-4 w-4" />
                            <span>{mood.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  
                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-red-200 dark:hover:bg-red-900/30 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Custom Tag Input */}
                  <div className="flex space-x-2 mb-3">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Add custom tag..."
                      onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomTag}
                      disabled={!customTag.trim()}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Suggested Tags */}
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags
                      .filter((tag) => !selectedTags.includes(tag))
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          onClick={() => addTag(tag)}
                        >
                          + {tag}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts, feelings, and reflections..."
                    className="min-h-[300px] resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={saveEntry}
                      disabled={isSaving || !title.trim() || !content.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSaving ? "Saving..." : editingEntry ? "Update" : "Create"}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}