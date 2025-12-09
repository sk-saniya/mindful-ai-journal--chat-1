"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navigation } from "@/components/navigation";
import { MoodTrends } from "@/components/dashboard/mood-trends";
import { DailyAffirmations } from "@/components/dashboard/daily-affirmations";
import { GoalsTracker } from "@/components/dashboard/goals-tracker";
import { MeditationTracker } from "@/components/dashboard/meditation-tracker";
import { GuidedMeditationPlayer } from "@/components/dashboard/guided-meditation-player";
import { CrisisSupport } from "@/components/dashboard/crisis-support";
import { StressTracker } from "@/components/dashboard/stress-tracker";
import { SleepTracker } from "@/components/dashboard/sleep-tracker";
import { ActivityTracker } from "@/components/dashboard/activity-tracker";
import { MoodTrackerSlider } from "@/components/mood-tracker-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Brain, Moon, Activity, TrendingUp } from "lucide-react";

interface StressEntry {
  id: number;
  stressLevel: number;
  createdAt: string;
}

interface SleepEntry {
  id: number;
  hoursSlept: number;
  quality: number;
  sleepDate: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stressRecords, setStressRecords] = useState<StressEntry[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepEntry[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchWellnessRecords();
    }
  }, [session]);

  const fetchWellnessRecords = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      
      const [stressRes, sleepRes] = await Promise.all([
        fetch("/api/stress-tracking?limit=7", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/sleep-tracking?limit=7", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (stressRes.ok) {
        const stressData = await stressRes.json();
        setStressRecords(stressData);
      }

      if (sleepRes.ok) {
        const sleepData = await sleepRes.json();
        setSleepRecords(sleepData);
      }
    } catch (error) {
      console.error("Failed to fetch wellness records:", error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleMoodSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <main className="flex-1 pt-16 px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[400px] w-full" />
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

  const averageStress = stressRecords.length > 0
    ? (stressRecords.reduce((sum, entry) => sum + entry.stressLevel, 0) / stressRecords.length).toFixed(1)
    : "0";

  const averageHours = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, entry) => sum + entry.hoursSlept, 0) / sleepRecords.length).toFixed(1)
    : "0";

  const averageQuality = sleepRecords.length > 0
    ? (sleepRecords.reduce((sum, entry) => sum + entry.quality, 0) / sleepRecords.length).toFixed(1)
    : "0";

  // Varied colors for floating bubbles
  const bubbleColors = [
    "from-blue-400 to-cyan-400",
    "from-purple-400 to-pink-400",
    "from-green-400 to-emerald-400",
    "from-yellow-400 to-orange-400",
    "from-rose-400 to-red-400",
    "from-indigo-400 to-purple-400",
    "from-teal-400 to-cyan-400",
    "from-fuchsia-400 to-pink-400",
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles with varied colors */}
        {[...Array(20)].map((_, i) => {
          const colorGradient = bubbleColors[i % bubbleColors.length];
          return (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 bg-gradient-to-r ${colorGradient} rounded-full opacity-30`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      <Navigation />

      <main className="flex-1 pt-16 px-4 py-8 relative z-10">
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
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Track your wellness journey and discover insights
            </p>

            {/* Mood Tracker Slider */}
            <MoodTrackerSlider 
              onMoodSelect={handleMoodSelect}
              onMoodSaved={handleMoodSaved}
            />
          </motion.div>

          {/* Wellness Summary Cards - 3 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-6"
          >
            {/* Stress Summary Card */}
            <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
                    <Brain className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stress Level</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
                  </div>
                </div>
              </div>
              {isLoadingRecords ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div>
                  <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {averageStress}/10
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Average stress level
                  </p>
                  {stressRecords.length > 0 && (
                    <div className="flex gap-1">
                      {stressRecords.slice(0, 7).map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex-1 h-2 rounded ${
                            entry.stressLevel <= 3
                              ? "bg-green-400"
                              : entry.stressLevel <= 6
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                          title={`${entry.stressLevel}/10 - ${new Date(entry.createdAt).toLocaleDateString()}`}
                        />
                      ))}
                    </div>
                  )}
                  {stressRecords.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No records yet</p>
                  )}
                </div>
              )}
            </Card>

            {/* Sleep Summary Card */}
            <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
                    <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sleep Quality</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
                  </div>
                </div>
              </div>
              {isLoadingRecords ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {averageHours}h
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg hours</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {averageQuality}/10
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg quality</p>
                    </div>
                  </div>
                  {sleepRecords.length > 0 && (
                    <div className="flex gap-1">
                      {sleepRecords.slice(0, 7).map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex-1 h-2 rounded ${
                            entry.quality <= 3
                              ? "bg-red-400"
                              : entry.quality <= 6
                              ? "bg-yellow-400"
                              : "bg-green-400"
                          }`}
                          title={`${entry.hoursSlept}h, Quality: ${entry.quality}/10 - ${new Date(entry.sleepDate).toLocaleDateString()}`}
                        />
                      ))}
                    </div>
                  )}
                  {sleepRecords.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No records yet</p>
                  )}
                </div>
              )}
            </Card>

            {/* Wellness Insights Card */}
            <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Insights</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your progress</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">✨ Mood tracked</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Today</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">📊 {stressRecords.length} stress logs</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">7 days</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">🌙 {sleepRecords.length} sleep logs</span>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">7 days</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Mood Trends - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6"
          >
            <MoodTrends key={refreshKey} selectedMood={selectedMood} />
          </motion.div>

          {/* Main Content Grid - 2 columns */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wellness Trackers Grid - 3 columns */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid md:grid-cols-3 gap-6"
              >
                <StressTracker />
                <SleepTracker />
                <ActivityTracker />
              </motion.div>

              {/* Goals and Meditation - 2 columns */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <GoalsTracker />
                <MeditationTracker />
              </motion.div>

              {/* Crisis Support - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <CrisisSupport />
              </motion.div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Guided Meditation Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GuidedMeditationPlayer />
              </motion.div>

              {/* Daily Affirmations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <DailyAffirmations />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}