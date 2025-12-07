"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Filter } from "lucide-react";

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

interface MoodGraphProps {
  selectedMood?: string | null;
}

export const MoodGraph = ({ selectedMood }: MoodGraphProps) => {
  const [moodData, setMoodData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/mood-tracking?limit=30", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: MoodEntry[] = await response.json();
        
        // Transform data for chart
        const chartData = data
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((entry) => ({
            date: new Date(entry.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            mood: entry.moodValue,
            label: entry.moodLabel,
            color: getMoodColor(entry.moodLabel),
          }));

        setMoodData(chartData);
      }
    } catch (error) {
      console.error("Failed to fetch mood data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on selected mood
  const filteredData = selectedMood
    ? moodData.filter((entry) => entry.label.toLowerCase() === selectedMood.toLowerCase())
    : moodData;

  const averageMood = filteredData.length > 0
    ? (filteredData.reduce((sum, entry) => sum + entry.mood, 0) / filteredData.length).toFixed(1)
    : "0";

  // Custom dot renderer with different colors
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={payload.color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

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
            {selectedMood && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20"
              >
                <Filter className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 capitalize">
                  {selectedMood}
                </span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              Avg: {averageMood}/10
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedMood 
                ? `No ${selectedMood} mood data yet. Try a different mood!`
                : "No mood data yet. Start tracking to see your trends!"}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
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
                formatter={(value: any, name: any, props: any) => [
                  `${value}/10 - ${props.payload.label}`,
                  "Mood"
                ]}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {filteredData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center"
          >
            {selectedMood 
              ? `Showing ${filteredData.length} ${selectedMood} ${filteredData.length === 1 ? "entry" : "entries"}`
              : `Tracking ${filteredData.length} mood ${filteredData.length === 1 ? "entry" : "entries"} over the last 30 days`}
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};