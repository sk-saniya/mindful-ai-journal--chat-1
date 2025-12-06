"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Moon, Cloud, Sun } from "lucide-react";
import { toast } from "sonner";

const sleepQualities = [
  { range: [1, 4], label: "Poor", color: "from-red-400 to-orange-500", icon: Cloud },
  { range: [5, 7], label: "Fair", color: "from-yellow-400 to-amber-500", icon: Moon },
  { range: [8, 10], label: "Good", color: "from-blue-400 to-indigo-500", icon: Sun },
];

export const SleepLevel = () => {
  const [sleepHours, setSleepHours] = useState<number[]>([7]);
  const [sleepQuality, setSleepQuality] = useState<number[]>([7]);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuality = sleepQualities.find(
    (quality) => sleepQuality[0] >= quality.range[0] && sleepQuality[0] <= quality.range[1]
  );

  const Icon = currentQuality?.icon || Moon;

  const handleLogSleep = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/mood-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moodValue: sleepQuality[0],
          moodLabel: "peaceful",
          notes: `Sleep: ${sleepHours[0]}h, Quality: ${currentQuality?.label}`,
        }),
      });
      toast.success("Sleep data logged!");
    } catch (error) {
      toast.error("Failed to log sleep data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sleep Tracker
          </h3>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`p-3 rounded-full bg-gradient-to-br ${currentQuality?.color}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        </div>

        {/* Sleep Hours */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hours Slept
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {sleepHours[0]}h
            </span>
          </div>

          <Slider
            value={sleepHours}
            onValueChange={setSleepHours}
            min={1}
            max={12}
            step={0.5}
            className="w-full"
          />

          {/* Visual representation */}
          <div className="mt-3 flex items-center space-x-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: i < sleepHours[0] ? 1 : 0.2,
                  scale: i < sleepHours[0] ? 1 : 0.8
                }}
                transition={{ delay: i * 0.05 }}
                className={`flex-1 h-2 rounded-full ${
                  i < sleepHours[0]
                    ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sleep Quality: {sleepQuality[0]}/10
            </span>
            <motion.span
              key={currentQuality?.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentQuality?.color} text-white text-sm font-medium`}
            >
              {currentQuality?.label}
            </motion.span>
          </div>

          <Slider
            value={sleepQuality}
            onValueChange={setSleepQuality}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        {/* Sleep Tips */}
        <motion.div
          key={`${sleepHours[0]}-${currentQuality?.label}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {sleepHours[0] < 6 && "Try to get more rest. Aim for 7-9 hours of sleep."}
            {sleepHours[0] >= 6 && sleepHours[0] <= 9 && sleepQuality[0] >= 7 && "Excellent! You're getting quality rest."}
            {sleepHours[0] >= 6 && sleepHours[0] <= 9 && sleepQuality[0] < 7 && "Good duration, but focus on improving sleep quality."}
            {sleepHours[0] > 9 && "You might be oversleeping. Consider a sleep schedule."}
          </p>
        </motion.div>

        <Button
          onClick={handleLogSleep}
          disabled={isLoading}
          className={`w-full bg-gradient-to-r ${currentQuality?.color} hover:opacity-90`}
        >
          {isLoading ? "Logging..." : "Log Sleep Data"}
        </Button>
      </motion.div>
    </Card>
  );
};
