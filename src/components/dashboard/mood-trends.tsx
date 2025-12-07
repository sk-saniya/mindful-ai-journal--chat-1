"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar } from "lucide-react";

interface MoodEntry {
  id: number;
  moodValue: number;
  moodLabel: string;
  createdAt: string;
}

// Mood color mapping
const moodColors: Record<string, string> = {
  anxious: "#9CA3AF",
  calm: "#60A5FA",
  happy: "#FCD34D",
  sad: "#A78BFA",
  stressed: "#F87171",
  peaceful: "#34D399",
  energetic: "#FBBF24",
  tired: "#94A3B8",
};

const getMoodColor = (moodLabel: string): string => {
  const mood = moodLabel.toLowerCase();
  return moodColors[mood] || "#8B5CF6";
};

interface MoodTrendsProps {
  selectedMood?: string | null;
}

type TimeRange = "week" | "month";

export const MoodTrends = ({ selectedMood }: MoodTrendsProps) => {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  useEffect(() => {
    fetchMoodData();
  }, [timeRange]);

  const fetchMoodData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const limit = timeRange === "week" ? 50 : 100;
      const response = await fetch(`/api/mood-tracking?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: MoodEntry[] = await response.json();
        setMoodData(data);
      }
    } catch (error) {
      console.error("Failed to fetch mood data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange === "week") {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setDate(now.getDate() - 30);
    }

    return moodData.filter(
      (entry) => new Date(entry.createdAt) >= cutoffDate
    );
  };

  const filteredData = getFilteredData();

  // Get unique mood labels
  const uniqueMoods = Array.from(
    new Set(filteredData.map((entry) => entry.moodLabel.toLowerCase()))
  );

  // Transform data for multi-line chart
  const chartData = (() => {
    // Group by date
    const dateMap = new Map<string, Record<string, number>>();

    filteredData
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((entry) => {
        const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        
        if (!dateMap.has(date)) {
          dateMap.set(date, {});
        }
        
        const moodKey = entry.moodLabel.toLowerCase();
        dateMap.get(date)![moodKey] = entry.moodValue;
      });

    return Array.from(dateMap.entries()).map(([date, moods]) => ({
      date,
      ...moods,
    }));
  })();

  const averageMood = filteredData.length > 0
    ? (filteredData.reduce((sum, entry) => sum + entry.moodValue, 0) / filteredData.length).toFixed(1)
    : "0";

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mood Trends
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                size="sm"
                variant={timeRange === "week" ? "default" : "ghost"}
                onClick={() => setTimeRange("week")}
                className={timeRange === "week" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Week
              </Button>
              <Button
                size="sm"
                variant={timeRange === "month" ? "default" : "ghost"}
                onClick={() => setTimeRange("month")}
                className={timeRange === "month" ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Month
              </Button>
            </div>

            {/* Average */}
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                Avg: {averageMood}/10
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[350px] w-full" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              No mood data yet. Start tracking to see your trends!
            </p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                
                {/* Render a line for each mood type */}
                {uniqueMoods.map((mood) => (
                  <Line
                    key={mood}
                    type="monotone"
                    dataKey={mood}
                    stroke={getMoodColor(mood)}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                    name={mood}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center"
            >
              Tracking {filteredData.length} mood {filteredData.length === 1 ? "entry" : "entries"} over the last {timeRange === "week" ? "7 days" : "30 days"}
            </motion.div>
          </>
        )}
      </motion.div>
    </Card>
  );
};
