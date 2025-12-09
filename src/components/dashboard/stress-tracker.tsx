"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Brain, Plus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface StressEntry {
  id: number;
  stressLevel: number;
  notes: string | null;
  createdAt: string;
}

export const StressTracker = () => {
  const [stressLevel, setStressLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [recentEntries, setRecentEntries] = useState<StressEntry[]>([]);

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/stress-tracking?limit=7", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch stress data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/stress-tracking", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stressLevel,
          notes: null,
        }),
      });

      if (response.ok) {
        toast.success("Stress level recorded!");
        await fetchRecentEntries();
      } else {
        toast.error("Failed to save stress level");
      }
    } catch (error) {
      toast.error("Failed to save stress level");
    } finally {
      setIsSaving(false);
    }
  };

  const getStressColor = (level: number) => {
    if (level <= 3) return "text-green-600 dark:text-green-400";
    if (level <= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStressLabel = (level: number) => {
    if (level <= 3) return "Low";
    if (level <= 6) return "Moderate";
    return "High";
  };

  const averageStress = recentEntries.length > 0
    ? (recentEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) / recentEntries.length).toFixed(1)
    : "0";

  if (isLoading) {
    return <Skeleton className="h-[280px] w-full" />;
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
            <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
              <Brain className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Stress Level
            </h3>
          </div>
          <div className={`text-sm font-semibold ${getStressColor(parseFloat(averageStress))}`}>
            Avg: {averageStress}/10
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-1 ${getStressColor(stressLevel)}`}>
              {stressLevel}/10
            </div>
            <div className={`text-sm font-medium ${getStressColor(stressLevel)}`}>
              {getStressLabel(stressLevel)} Stress
            </div>
          </div>

          <Slider
            value={[stressLevel]}
            onValueChange={(value) => setStressLevel(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Record Stress Level
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </Card>
  );
};