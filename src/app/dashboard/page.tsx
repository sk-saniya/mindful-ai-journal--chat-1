"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navigation } from "@/components/navigation";
import { MoodGraph } from "@/components/dashboard/mood-graph";
import { BreathingExercise } from "@/components/dashboard/breathing-exercise";
import { TaskActivity } from "@/components/dashboard/task-activity";
import { StressLevel } from "@/components/dashboard/stress-level";
import { SleepLevel } from "@/components/dashboard/sleep-level";
import { CrisisSupport } from "@/components/dashboard/crisis-support";
import { MoodTrackerSlider } from "@/components/mood-tracker-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { TrendingUp, Activity, Heart } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <main className="flex-1 pt-16 px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid lg:grid-cols-2 gap-6">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="flex-1 pt-16 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track your wellness metrics and progress
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 border-0 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Mood Entries</p>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Tasks Completed</p>
                    <p className="text-3xl font-bold">12</p>
                  </div>
                  <Activity className="h-8 w-8 opacity-80" />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Wellness Score</p>
                    <p className="text-3xl font-bold">85%</p>
                  </div>
                  <Heart className="h-8 w-8 opacity-80" />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Mood Tracker Slider Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mb-6"
          >
            <MoodTrackerSlider />
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Stress Level */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <StressLevel />
            </motion.div>

            {/* Sleep Level */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SleepLevel />
            </motion.div>
          </div>

          {/* Mood Graph - Full Width */}
          <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-6"
          >
            <MoodGraph />
          </motion.div>

          {/* Breathing Exercise - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-6"
          >
            <BreathingExercise />
          </motion.div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Task Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <TaskActivity />
            </motion.div>

            {/* Crisis Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <CrisisSupport />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}