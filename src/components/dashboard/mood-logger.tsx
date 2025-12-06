"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Smile, Frown, Meh, Heart, Zap, Moon, Sun, Cloud } from "lucide-react";
import { toast } from "sonner";

const moods = [
  { id: "anxious", label: "Anxious", icon: Cloud, color: "from-gray-400 to-gray-600" },
  { id: "calm", label: "Calm", icon: Moon, color: "from-blue-400 to-blue-600" },
  { id: "happy", label: "Happy", icon: Smile, color: "from-yellow-400 to-orange-500" },
  { id: "sad", label: "Sad", icon: Frown, color: "from-indigo-400 to-purple-600" },
  { id: "stressed", label: "Stressed", icon: Zap, color: "from-red-400 to-red-600" },
  { id: "peaceful", label: "Peaceful", icon: Heart, color: "from-green-400 to-emerald-600" },
  { id: "energetic", label: "Energetic", icon: Sun, color: "from-amber-400 to-orange-600" },
  { id: "tired", label: "Tired", icon: Meh, color: "from-slate-400 to-slate-600" },
];

interface MoodLoggerProps {
  onMoodLogged?: () => void;
}

export const MoodLogger = ({ onMoodLogged }: MoodLoggerProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodValue, setMoodValue] = useState<number[]>([5]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/mood-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moodValue: moodValue[0],
          moodLabel: selectedMood,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log mood");
      }

      toast.success("Mood logged successfully!");
      setSelectedMood(null);
      setMoodValue([5]);
      setNotes("");
      
      if (onMoodLogged) {
        onMoodLogged();
      }
    } catch (error) {
      toast.error("Failed to log mood. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMoodData = moods.find((m) => m.id === selectedMood);

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          How are you feeling?
        </h3>

        {/* Mood Selection Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {moods.map((mood) => {
            const Icon = mood.icon;
            const isSelected = selectedMood === mood.id;

            return (
              <motion.button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg bg-gradient-to-br ${mood.color} mb-2`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {mood.label}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Intensity Slider */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 mb-6"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Intensity: {moodValue[0]}/10
                </label>
                {selectedMoodData && (
                  <div
                    className={`px-3 py-1 rounded-full bg-gradient-to-r ${selectedMoodData.color} text-white text-sm font-medium`}
                  >
                    {selectedMoodData.label}
                  </div>
                )}
              </div>
              <Slider
                value={moodValue}
                onValueChange={setMoodValue}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? "Logging..." : "Log Mood"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};
