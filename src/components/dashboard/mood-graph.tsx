"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

interface MoodEntry {
  id: number;
  moodValue: number;
  moodLabel: string;
  createdAt: string;
}

// Mood color mapping with animated gradients
const moodColors: Record<string, { color: string; gradient: string }> = {
  anxious: { color: "#9CA3AF", gradient: "from-gray-400 to-gray-600" },
  calm: { color: "#60A5FA", gradient: "from-blue-400 to-blue-600" },
  happy: { color: "#FCD34D", gradient: "from-yellow-400 to-orange-500" },
  sad: { color: "#A78BFA", gradient: "from-indigo-400 to-purple-600" },
  stressed: { color: "#F87171", gradient: "from-red-400 to-red-600" },
  peaceful: { color: "#34D399", gradient: "from-green-400 to-emerald-600" },
  energetic: { color: "#FBBF24", gradient: "from-amber-400 to-orange-600" },
  tired: { color: "#94A3B8", gradient: "from-slate-400 to-slate-600" },
};

const getMoodColor = (moodLabel: string): string => {
  const mood = moodLabel.toLowerCase();
  return moodColors[mood]?.color || "#8B5CF6";
};

export const MoodGraph = () => {
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

  const averageMood = moodData.length > 0
    ? (moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length).toFixed(1)
    : "0";

  // Custom dot renderer with different colors
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={payload.color}
          stroke="#fff"
          strokeWidth={2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill={payload.color}
          opacity={0.2}
        />
      </g>
    );
  };

  // Custom line segment with gradient colors
  const CustomLine = (props: any) => {
    const { points, stroke } = props;
    if (!points || points.length < 2) return null;

    return (
      <g>
        {points.slice(0, -1).map((point: any, index: number) => {
          const nextPoint = points[index + 1];
          const color = moodData[index]?.color || "#8B5CF6";
          
          return (
            <line
              key={index}
              x1={point.x}
              y1={point.y}
              x2={nextPoint.x}
              y2={nextPoint.y}
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
      </g>
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
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mood Trends
          </h3>
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
        ) : moodData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              No mood data yet. Start tracking to see your trends!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodData}>
              <defs>
                {Object.entries(moodColors).map(([mood, { color }]) => (
                  <linearGradient key={mood} id={`gradient-${mood}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
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
                strokeWidth={0}
                dot={<CustomDot />}
                activeDot={{ r: 8 }}
                shape={<CustomLine />}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {moodData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center"
          >
            Tracking {moodData.length} mood {moodData.length === 1 ? "entry" : "entries"} over the last 30 days
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};