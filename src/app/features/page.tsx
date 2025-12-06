"use client";

import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  BookOpen,
  Brain,
  TrendingUp,
  Calendar,
  MessageSquare,
  Wind,
  Lock,
  Sparkles,
  BarChart3,
  Heart,
  Target,
  Zap,
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: BookOpen,
      title: "AI-Powered Journaling",
      description:
        "Express your thoughts freely and receive intelligent insights from our advanced AI. Get personalized prompts and reflections to deepen your self-awareness.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "Mood Tracking",
      description:
        "Track your emotional states throughout the day. Identify patterns, triggers, and understand what influences your mental well-being.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MessageSquare,
      title: "AI Chat Companion",
      description:
        "Have meaningful conversations with an empathetic AI that listens without judgment. Get support anytime you need someone to talk to.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description:
        "Visualize your mental health journey with beautiful, insightful graphs. Track improvements and celebrate your growth over time.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Wind,
      title: "Breathing Exercises",
      description:
        "Guided breathing techniques to reduce stress and anxiety. Practice box breathing, 4-7-8 technique, or calm breathing whenever you need.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Calendar,
      title: "Task Management",
      description:
        "Organize your daily tasks and build healthy routines. Set priorities, track completion, and maintain consistency in your wellness goals.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: BarChart3,
      title: "Mood Graphs",
      description:
        "Interactive charts that show your mood patterns over days, weeks, and months. Understand your emotional rhythms and identify trends.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Heart,
      title: "Self-Care Reminders",
      description:
        "Gentle nudges to take care of yourself throughout the day. Stay hydrated, take breaks, and practice mindfulness regularly.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Lock,
      title: "Private & Secure",
      description:
        "Your data is encrypted and completely private. We take your privacy seriously and never share your personal information.",
      color: "from-gray-600 to-gray-800",
    },
    {
      icon: Target,
      title: "Goal Setting",
      description:
        "Set meaningful wellness goals and track your progress. Break down big objectives into manageable steps and celebrate milestones.",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Sparkles,
      title: "Daily Insights",
      description:
        "Receive personalized insights based on your journal entries and mood patterns. Discover what works best for your mental health.",
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: Zap,
      title: "Quick Check-ins",
      description:
        "Fast mood logging for busy days. Track how you're feeling in seconds with our intuitive interface.",
      color: "from-red-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-bold mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Powerful Features
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Everything you need to support your mental wellness journey, all in
                one beautiful, intuitive platform
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
                  >
                    <motion.div
                      className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Experience All Features
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your journey to better mental wellness today
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-colors">
                Get Started Free
              </button>
            </motion.a>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
