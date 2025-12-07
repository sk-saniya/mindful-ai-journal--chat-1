"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

const meditationTypes = [
  {
    id: "guided",
    name: "Guided Meditation",
    duration: 600, // 10 minutes
    color: "from-blue-500 to-cyan-500",
    description: "Calm your mind with guided breathing",
  },
  {
    id: "breathing",
    name: "Breathing Exercise",
    duration: 300, // 5 minutes
    color: "from-purple-500 to-pink-500",
    description: "Focus on your breath",
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    duration: 900, // 15 minutes
    color: "from-green-500 to-emerald-500",
    description: "Be present in the moment",
  },
];

export const GuidedMeditationPlayer = () => {
  const [selectedType, setSelectedType] = useState<typeof meditationTypes[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const startMeditation = (type: typeof meditationTypes[0]) => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    setSelectedType(type);
    setTimeLeft(type.duration);
    setIsPlaying(true);
    setIsCompleted(false);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsPlaying(false);
          setIsCompleted(true);
          completeMeditation(type);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  };

  const pauseMeditation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPlaying(false);
  };

  const resumeMeditation = () => {
    if (!selectedType || timeLeft === 0) return;

    setIsPlaying(true);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsPlaying(false);
          setIsCompleted(true);
          completeMeditation(selectedType);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  };

  const resetMeditation = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setSelectedType(null);
    setIsPlaying(false);
    setTimeLeft(0);
    setIsCompleted(false);
  };

  const completeMeditation = async (type: typeof meditationTypes[0]) => {
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/meditation-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          duration: type.duration,
          type: type.id,
          completed: true,
        }),
      });

      toast.success("Meditation completed! 🧘‍♀️");
    } catch (error) {
      console.error("Failed to save meditation session:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = selectedType
    ? ((selectedType.duration - timeLeft) / selectedType.duration) * 100
    : 0;

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Guided Meditation
        </h3>

        <AnimatePresence mode="wait">
          {!selectedType ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {meditationTypes.map((type, index) => (
                <motion.button
                  key={type.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => startMeditation(type)}
                  className={`w-full p-4 rounded-lg bg-gradient-to-r ${type.color} text-white text-left hover:shadow-lg transition-all`}
                >
                  <p className="font-semibold">{type.name}</p>
                  <p className="text-sm opacity-90">{type.description}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {Math.round(type.duration / 60)} minutes
                  </p>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              {/* Progress Circle */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 88 * (1 - progress / 100),
                    }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Check className="h-16 w-16 text-green-500" />
                    </motion.div>
                  ) : (
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatTime(timeLeft)}
                    </p>
                  )}
                </div>
              </div>

              {/* Type Name */}
              <p className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {selectedType.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {isCompleted ? "Session Complete!" : selectedType.description}
              </p>

              {/* Controls */}
              <div className="flex justify-center space-x-3">
                {!isCompleted && (
                  <Button
                    onClick={isPlaying ? pauseMeditation : resumeMeditation}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                )}
                <Button
                  onClick={resetMeditation}
                  size="lg"
                  variant="outline"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
};
