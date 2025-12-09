"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Moon, Plus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface SleepEntry {
  id: number;
  hoursSlept: number;
  quality: number;
  sleepDate: string;
  notes: string | null;
  createdAt: string;
}

export const SleepTracker = () => {
  const [hoursSlept, setHoursSlept] = useState(7);
  const [quality, setQuality] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [recentEntries, setRecentEntries] = useState<SleepEntry[]>([]);

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/sleep-tracking?limit=7", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch sleep data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const today = new Date().toISOString().split("T")[0];
      
      const response = await fetch("/api/sleep-tracking", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hoursSlept,
          quality,
          sleepDate: today,
          notes: null,
        }),
      });

      if (response.ok) {
        toast.success("Sleep data recorded!");
        await fetchRecentEntries();
      } else {
        toast.error("Failed to save sleep data");
      }
    } catch (error) {
      toast.error("Failed to save sleep data");
    } finally {
      setIsSaving(false);
    }
  };

  const getQualityColor = (qual: number) => {
    if (qual <= 3) return "text-red-600 dark:text-red-400";
    if (qual <= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getQualityLabel = (qual: number) => {
    if (qual <= 3) return "Poor";
    if (qual <= 6) return "Fair";
    return "Good";
  };

  const averageHours = recentEntries.length > 0
    ? (recentEntries.reduce((sum, entry) => sum + entry.hoursSlept, 0) / recentEntries.length).toFixed(1)
    : "0";

  const averageQuality = recentEntries.length > 0
    ? (recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length).toFixed(1)
    : "0";

  if (isLoading) {
    return <Skeleton className="h-[320px] w-full" />;
  }

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
              <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Sleep Tracker
            </h3>
          </div>
          <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Avg: {averageHours}h
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {hoursSlept}h
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Hours Slept
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${getQualityColor(quality)}`}>
                {quality}/10
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Sleep Quality
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Hours Slept
              </label>
              <Slider
                value={[hoursSlept]}
                onValueChange={(value) => setHoursSlept(value[0])}
                min={1}
                max={12}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1h</span>
                <span>12h</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Quality ({getQualityLabel(quality)})
              </label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Record Sleep Data
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </Card>
  );
};