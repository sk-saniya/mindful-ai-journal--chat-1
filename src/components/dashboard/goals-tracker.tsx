"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Plus, CheckCircle2, Circle, Trash2, Edit2, X } from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: number;
  title: string;
  description: string | null;
  status: "active" | "completed" | "archived";
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export const GoalsTracker = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newGoal, setNewGoal] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/goals?limit=20&status=active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }

    setIsAdding(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description || null,
          status: "active",
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setGoals([created, ...goals]);
        setNewGoal({ title: "", description: "" });
        toast.success("Goal added!");
      }
    } catch (error) {
      toast.error("Failed to add goal");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleGoalStatus = async (goal: Goal) => {
    const newStatus = goal.status === "completed" ? "active" : "completed";

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/goals?id=${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        setGoals(
          goals.map((g) =>
            g.id === goal.id ? { ...g, status: newStatus } : g
          )
        );
        toast.success(newStatus === "completed" ? "Goal completed! 🎉" : "Goal reactivated");
      }
    } catch (error) {
      toast.error("Failed to update goal");
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/goals?id=${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGoals(goals.filter((g) => g.id !== goalId));
        toast.success("Goal deleted");
      }
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const activeCount = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Goals</span>
          </h3>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {activeCount} Active
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                {completedCount} Done
              </span>
            </div>
          </div>
        </div>

        {/* Add Goal Input */}
        <div className="space-y-2 mb-4">
          <Input
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="New goal title..."
            onKeyDown={(e) => e.key === "Enter" && addGoal()}
            disabled={isAdding}
          />
          <div className="flex space-x-2">
            <Input
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Description (optional)..."
              disabled={isAdding}
              className="flex-1"
            />
            <Button
              onClick={addGoal}
              disabled={isAdding}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Goals List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center">
            <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No goals yet. Add one to get started!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border transition-all ${
                    goal.status === "completed"
                      ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                      : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleGoalStatus(goal)}
                      className="flex-shrink-0 mt-1"
                    >
                      {goal.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 hover:text-purple-500" />
                      )}
                    </button>

                    <div className="flex-1">
                      <p
                        className={`font-semibold text-sm ${
                          goal.status === "completed"
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {goal.title}
                      </p>
                      {goal.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </motion.div>
    </Card>
  );
};
