"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navigation } from "@/components/navigation";
import { MoodGraph } from "@/components/dashboard/mood-graph";
import { BreathingExercise } from "@/components/dashboard/breathing-exercise";
import { TaskActivity } from "@/components/dashboard/task-activity";
import { CrisisSupport } from "@/components/dashboard/crisis-support";
import { MoodTrackerSlider } from "@/components/mood-tracker-slider";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleMoodSaved = () => {
    // Refresh the graph by updating the key
    setRefreshKey((prev) => prev + 1);
  };

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
            className="mb-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome back, {session.user.name}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track your wellness journey and discover insights
            </p>
          </motion.div>

          {/* Mood Tracker Slider Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <MoodTrackerSlider 
              onMoodSelect={setSelectedMood} 
              onMoodSaved={handleMoodSaved}
            />
          </motion.div>

          {/* Mood Graph - Full Width with Filtering */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <MoodGraph key={refreshKey} selectedMood={selectedMood} />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Breathing Exercise */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <BreathingExercise />
            </motion.div>

            {/* Task Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TaskActivity />
            </motion.div>
          </div>

          {/* Wellness Support - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CrisisSupport />
          </motion.div>
        </div>
      </main>
    </div>
  );
}