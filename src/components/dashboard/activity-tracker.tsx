"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityEntry {
  id: number;
  activityName: string;
  completed: boolean;
  completionDate: string;
  createdAt: string;
}

export const ActivityTracker = () => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newActivity, setNewActivity] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const today = new Date().toISOString().split("T")[0];
      
      const response = await fetch(`/api/activity-completions?startDate=${today}&endDate=${today}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim()) {
      toast.error("Please enter an activity name");
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const today = new Date().toISOString().split("T")[0];
      
      const response = await fetch("/api/activity-completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityName: newActivity.trim(),
          completed: false,
          completionDate: today,
        }),
      });

      if (response.ok) {
        toast.success("Activity added!");
        setNewActivity("");
        await fetchActivities();
      } else {
        toast.error("Failed to add activity");
      }
    } catch (error) {
      toast.error("Failed to add activity");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("bearer_token");
      
      const response = await fetch(`/api/activity-completions?id=${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !currentStatus,
        }),
      });

      if (response.ok) {
        toast.success(currentStatus ? "Marked as incomplete" : "Marked as complete!");
        await fetchActivities();
      } else {
        toast.error("Failed to update activity");
      }
    } catch (error) {
      toast.error("Failed to update activity");
    }
  };

  const handleDeleteActivity = async (id: number, activityName: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      
      const response = await fetch(`/api/activity-completions?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`"${activityName}" deleted successfully`);
        await fetchActivities();
      } else {
        toast.error("Failed to delete activity");
      }
    } catch (error) {
      toast.error("Failed to delete activity");
    }
  };

  const completedCount = activities.filter((a) => a.completed).length;
  const totalCount = activities.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
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
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Today's Activities
            </h3>
          </div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            {completionRate}% Complete
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
              placeholder="Add a new activity..."
              className="flex-1"
            />
            <Button
              onClick={handleAddActivity}
              disabled={isAdding || !newActivity.trim()}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {totalCount > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activities yet. Add one to get started!</p>
              </div>
            ) : (
              activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    activity.completed
                      ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleToggleComplete(activity.id, activity.completed)}
                  >
                    {activity.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                    )}
                    <span
                      className={`flex-1 ${
                        activity.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {activity.activityName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteActivity(activity.id, activity.activityName);
                    }}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </Card>
  );
};