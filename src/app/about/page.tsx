"use client";

import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Heart, Target, Users, Shield } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Empathy First",
      description:
        "We believe in creating a compassionate space where everyone feels heard, understood, and supported on their mental wellness journey.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Target,
      title: "Your Goals, Our Mission",
      description:
        "Your mental health and well-being are at the center of everything we do. We're committed to helping you achieve your wellness goals.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "While your data is private, you're never alone. We foster a supportive environment where everyone can thrive together.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Privacy & Trust",
      description:
        "Your personal information is sacred. We use industry-leading security measures to keep your data safe and completely confidential.",
      color: "from-green-500 to-emerald-500",
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
                  About Mindful AI
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                We're on a mission to make mental wellness accessible, 
                personalized, and effective for everyone
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                <p>
                  Mindful AI Journal was born from a simple belief: everyone deserves
                  access to quality mental health support. In a world where stress and
                  anxiety are increasingly common, we wanted to create a safe,
                  judgment-free space for self-reflection and growth.
                </p>
                <p>
                  By combining the power of artificial intelligence with proven
                  psychological techniques, we've built a platform that adapts to your
                  unique needs. Whether you're dealing with daily stress, working on
                  personal growth, or simply want to understand yourself better, Mindful
                  AI is here to support you.
                </p>
                <p>
                  Our AI doesn't replace professional therapy—it complements it. Think of
                  us as your personal wellness companion, available 24/7 to listen, guide,
                  and help you track your progress on your mental health journey.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div
                      className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${value.color} mb-4`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Join Our Mission
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Be part of a community dedicated to better mental wellness
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-colors">
                Start Your Journey
              </button>
            </motion.a>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
