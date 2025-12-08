"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Calendar, Bell, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [mounted, setMounted] = useState(false);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [moodReminders, setMoodReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleNotificationUpdate = (type: string, value: boolean) => {
    // In a real app, this would save to backend
    toast.success("Notification preferences updated!");
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error("Failed to sign out. Please try again.");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully!");
      router.push("/");
    }
  };

  if (isPending || !mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <main className="flex-1 pt-16 px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const createdDate = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Profile
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your account information and preferences
            </p>
          </motion.div>

          {/* Profile Cards */}
          <div className="space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Personal Information
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium mb-2 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </Label>
                    <Input
                      id="name"
                      value={session.user.name}
                      disabled
                      className="bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-2 flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      value={session.user.email}
                      disabled
                      className="bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="created" className="text-sm font-medium mb-2 flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member Since</span>
                    </Label>
                    <Input
                      id="created"
                      value={createdDate}
                      disabled
                      className="bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Notification Preferences
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="emailNotifications" className="text-base font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates and insights via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={(checked) => {
                        setEmailNotifications(checked);
                        handleNotificationUpdate("email", checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="pushNotifications" className="text-base font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get real-time notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={pushNotifications}
                      onCheckedChange={(checked) => {
                        setPushNotifications(checked);
                        handleNotificationUpdate("push", checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="moodReminders" className="text-base font-medium">
                        Daily Mood Reminders
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Remind me to track my mood each day
                      </p>
                    </div>
                    <Switch
                      id="moodReminders"
                      checked={moodReminders}
                      onCheckedChange={(checked) => {
                        setMoodReminders(checked);
                        handleNotificationUpdate("moodReminders", checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="weeklyReports" className="text-base font-medium">
                        Weekly Progress Reports
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get weekly summaries of your wellness journey
                      </p>
                    </div>
                    <Switch
                      id="weeklyReports"
                      checked={weeklyReports}
                      onCheckedChange={(checked) => {
                        setWeeklyReports(checked);
                        handleNotificationUpdate("weeklyReports", checked);
                      }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Logout Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Account Actions
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sign out of your account
                    </p>
                  </div>
                  <motion.button
                    onClick={handleSignOut}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 hover:from-rose-600 hover:via-red-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}