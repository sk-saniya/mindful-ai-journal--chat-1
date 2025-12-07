"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Frown, Meh, Heart, Zap, Moon, Cloud, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const moods = [
  {
    id: "sad",
    label: "Very Low",
    value: 2,
    icon: Frown,
    color: "from-indigo-400 to-purple-600",
    textColor: "text-indigo-600 dark:text-indigo-400",
    emoji: "😢",
  },
  {
    id: "anxious",
    label: "Low",
    value: 4,
    icon: Cloud,
    color: "from-gray-400 to-gray-600",
    textColor: "text-gray-600 dark:text-gray-400",
    emoji: "😟",
  },
  {
    id: "calm",
    label: "Neutral",
    value: 5,
    icon: Meh,
    color: "from-blue-400 to-blue-600",
    textColor: "text-blue-600 dark:text-blue-400",
    emoji: "😐",
  },
  {
    id: "happy",
    label: "Good",
    value: 7,
    icon: Smile,
    color: "from-yellow-400 to-orange-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
    emoji: "😊",
  },
  {
    id: "energetic",
    label: "Excellent",
    value: 10,
    icon: Zap,
    color: "from-green-400 to-emerald-600",
    textColor: "text-green-600 dark:text-green-400",
    emoji: "🤩",
  },
];

interface MoodTrackerSliderProps {
  onMoodSelect?: (moodId: string) => void;
  onMoodSaved?: () => void;
  hideSaveButton?: boolean;
}

export const MoodTrackerSlider = ({ onMoodSelect, onMoodSaved, hideSaveButton = false }: MoodTrackerSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const currentMood = moods[currentIndex];

  const handleSliderChange = (value: number) => {
    setCurrentIndex(value);
    setJustSaved(false);
    if (onMoodSelect) {
      onMoodSelect(moods[value].id);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/mood-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moodValue: currentMood.value,
          moodLabel: currentMood.id,
          notes: `Feeling ${currentMood.label.toLowerCase()} today`,
        }),
      });

      if (response.ok) {
        setJustSaved(true);
        toast.success(`Mood saved: ${currentMood.label}! 🎉`);
        
        if (onMoodSaved) {
          onMoodSaved();
        }

        setTimeout(() => setJustSaved(false), 3000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save mood");
      }
    } catch (error) {
      toast.error("Failed to save mood");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-gray-200 dark:border-gray-700 shadow-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Animated Emoji */}
        <motion.div
          key={currentMood.emoji}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15 
          }}
          className="text-7xl mb-4 inline-block"
        >
          {currentMood.emoji}
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          How are you feeling today?
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
          Track your mood daily and discover patterns in your emotional wellness
        </p>

        {/* Slider Container */}
        <div className="relative px-4 mb-8">
          {/* Slider Track - Removed gradient colors, now neutral */}
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
            {/* Active Track */}
            <motion.div
              className={`absolute h-2 rounded-full bg-gradient-to-r ${currentMood.color}`}
              initial={{ width: "0%" }}
              animate={{ 
                width: `${(currentIndex / (moods.length - 1)) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>

          {/* Slider Input */}
          <input
            type="range"
            min="0"
            max={moods.length - 1}
            value={currentIndex}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer z-10"
            style={{ margin: "0 16px", width: "calc(100% - 32px)" }}
          />

          {/* Slider Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-lg border-4 pointer-events-none z-20"
            style={{
              borderColor: `transparent`,
              left: `calc(${(currentIndex / (moods.length - 1)) * 100}% + 16px)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentMood.color} -z-10`} />
          </motion.div>

          {/* Labels */}
          <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mt-6">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleSliderChange(moods.indexOf(mood))}
                className={`transition-colors hover:text-gray-900 dark:hover:text-white ${
                  currentMood.id === mood.id ? currentMood.textColor + " font-bold" : ""
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Mood Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMood.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              You're feeling:{" "}
              <span className={`bg-gradient-to-r ${currentMood.color} bg-clip-text text-transparent`}>
                {currentMood.label}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Save Button - Conditionally rendered */}
        {!hideSaveButton && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleSave}
              disabled={isSaving || justSaved}
              size="lg"
              className={`
                px-8 py-6 text-lg font-semibold rounded-full shadow-lg transition-all
                ${justSaved
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                }
              `}
            >
              {isSaving ? (
                "Saving..."
              ) : justSaved ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mr-2 inline"
                  >
                    <Check className="h-5 w-5 inline" />
                  </motion.div>
                  Saved!
                </>
              ) : (
                "Save Mood"
              )}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};