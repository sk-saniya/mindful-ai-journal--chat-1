"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp } from "lucide-react";

interface MeditationSession {
  id: number;
  duration: number;
  type: "guided" | "breathing" | "mindfulness";
  completed: boolean;
  createdAt: string;
}

export const MeditationTracker = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Get sessions from last 7 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const response = await fetch(
        `/api/meditation-sessions?limit=50&startDate=${startDate.toISOString().split('T')[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch meditation sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  const completedCount = sessions.filter((s) => s.completed).length;
  const thisWeekSessions = sessions.length;

  const avgMinutes = thisWeekSessions > 0 ? Math.round(totalMinutes / thisWeekSessions) : 0;

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Meditation</span>
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Minutes This Week */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20"
            >
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {totalMinutes}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Minutes This Week
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"
              >
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {thisWeekSessions}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sessions
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center"
              >
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedCount}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Completed
                </p>
              </motion.div>
            </div>

            {/* Average */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Avg: {avgMinutes} min/session</span>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Card>
  );
};
