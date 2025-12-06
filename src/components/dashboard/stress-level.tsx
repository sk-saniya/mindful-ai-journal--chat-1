"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const stressLevels = [
  { range: [1, 3], label: "Low", color: "from-green-400 to-emerald-500", icon: CheckCircle },
  { range: [4, 6], label: "Moderate", color: "from-yellow-400 to-orange-500", icon: AlertTriangle },
  { range: [7, 10], label: "High", color: "from-red-400 to-red-600", icon: Zap },
];

export const StressLevel = () => {
  const [stressValue, setStressValue] = useState<number[]>([5]);
  const [isLoading, setIsLoading] = useState(false);

  const currentLevel = stressLevels.find(
    (level) => stressValue[0] >= level.range[0] && stressValue[0] <= level.range[1]
  );

  const Icon = currentLevel?.icon || Zap;

  const handleLogStress = async () => {
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
          moodValue: stressValue[0],
          moodLabel: "stressed",
          notes: `Stress level: ${currentLevel?.label}`,
        }),
      });
      toast.success("Stress level logged!");
    } catch (error) {
      toast.error("Failed to log stress level");
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
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Stress Level
          </h3>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className={`p-3 rounded-full bg-gradient-to-br ${currentLevel?.color}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        </div>

        {/* Animated Stress Meter */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Level: {stressValue[0]}/10
            </span>
            <motion.span
              key={currentLevel?.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentLevel?.color} text-white text-sm font-medium`}
            >
              {currentLevel?.label}
            </motion.span>
          </div>

          <Slider
            value={stressValue}
            onValueChange={setStressValue}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />

          {/* Visual Bar */}
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stressValue[0] / 10) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full bg-gradient-to-r ${currentLevel?.color}`}
            />
          </div>
        </div>

        {/* Tips based on stress level */}
        <motion.div
          key={currentLevel?.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stressValue[0] <= 3 && "Great! Keep maintaining your calm with regular mindfulness."}
            {stressValue[0] >= 4 && stressValue[0] <= 6 && "Consider taking short breaks and practicing breathing exercises."}
            {stressValue[0] >= 7 && "High stress detected. Try deep breathing or reach out for support."}
          </p>
        </motion.div>

        <Button
          onClick={handleLogStress}
          disabled={isLoading}
          className={`w-full bg-gradient-to-r ${currentLevel?.color} hover:opacity-90`}
        >
          {isLoading ? "Logging..." : "Log Stress Level"}
        </Button>
      </motion.div>
    </Card>
  );
};
