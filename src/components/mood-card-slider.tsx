"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Smile, Frown, Meh, Zap, Cloud, Heart, Sun, Sparkles } from "lucide-react";

const moods = [
  {
    id: "sad",
    label: "Very Low",
    emoji: "😢",
    icon: Frown,
    color: "from-indigo-500 via-purple-500 to-pink-500",
    bgGlow: "bg-indigo-400/30",
    description: "It's okay to feel down",
  },
  {
    id: "anxious",
    label: "Low",
    emoji: "😟",
    icon: Cloud,
    color: "from-gray-500 via-slate-500 to-zinc-500",
    bgGlow: "bg-gray-400/30",
    description: "Take a deep breath",
  },
  {
    id: "calm",
    label: "Neutral",
    emoji: "😐",
    icon: Meh,
    color: "from-blue-500 via-cyan-500 to-teal-500",
    bgGlow: "bg-blue-400/30",
    description: "Balanced and steady",
  },
  {
    id: "happy",
    label: "Good",
    emoji: "😊",
    icon: Smile,
    color: "from-yellow-500 via-amber-500 to-orange-500",
    bgGlow: "bg-yellow-400/30",
    description: "Keep spreading joy",
  },
  {
    id: "energetic",
    label: "Excellent",
    emoji: "🤩",
    icon: Zap,
    color: "from-green-500 via-emerald-500 to-teal-500",
    bgGlow: "bg-green-400/30",
    description: "Riding the high wave!",
  },
  {
    id: "peaceful",
    label: "Peaceful",
    emoji: "😌",
    icon: Heart,
    color: "from-rose-500 via-pink-500 to-fuchsia-500",
    bgGlow: "bg-rose-400/30",
    description: "Inner harmony achieved",
  },
  {
    id: "vibrant",
    label: "Vibrant",
    emoji: "✨",
    icon: Sparkles,
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGlow: "bg-violet-400/30",
    description: "Full of life energy",
  },
  {
    id: "bright",
    label: "Bright",
    emoji: "☀️",
    icon: Sun,
    color: "from-orange-500 via-red-500 to-pink-500",
    bgGlow: "bg-orange-400/30",
    description: "Shining from within",
  },
];

export const MoodCardSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  const onDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      if (offset > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (offset < 0 && currentIndex < moods.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const currentMood = moods[currentIndex];
  const Icon = currentMood.icon;

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          How Are You Feeling Today?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Drag or swipe to explore different moods
        </p>
      </motion.div>

      {/* Main Card Display */}
      <div className="relative h-[400px] md:h-[450px] mb-8 overflow-hidden" ref={containerRef}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
          style={{ x: dragX }}
          className="flex items-center justify-center h-full cursor-grab active:cursor-grabbing"
        >
          {moods.map((mood, index) => {
            const MoodIcon = mood.icon;
            const offset = index - currentIndex;
            const isActive = index === currentIndex;

            return (
              <motion.div
                key={mood.id}
                animate={{
                  scale: isActive ? 1 : 0.8,
                  x: offset * 280,
                  opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.5,
                  rotateY: offset * 15,
                  z: isActive ? 0 : -100,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="absolute w-72 md:w-80"
                style={{
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div
                  className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
                >
                  {/* Background Glow */}
                  <div
                    className={`absolute inset-0 ${mood.bgGlow} blur-3xl opacity-50`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      animate={{
                        rotate: isActive ? [0, 5, -5, 0] : 0,
                        scale: isActive ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${mood.color} flex items-center justify-center shadow-lg`}
                    >
                      <MoodIcon className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Emoji */}
                    <motion.div
                      animate={{
                        y: isActive ? [0, -10, 0] : 0,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-6xl mb-4 text-center"
                    >
                      {mood.emoji}
                    </motion.div>

                    {/* Label */}
                    <h3
                      className={`text-3xl font-bold mb-3 text-center bg-gradient-to-r ${mood.color} bg-clip-text text-transparent`}
                    >
                      {mood.label}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                      {mood.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {moods.map((mood, index) => (
          <button
            key={mood.id}
            onClick={() => setCurrentIndex(index)}
            className="group relative"
            aria-label={`Go to ${mood.label}`}
          >
            <motion.div
              animate={{
                scale: index === currentIndex ? 1.2 : 1,
                opacity: index === currentIndex ? 1 : 0.5,
              }}
              className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${mood.color} transition-all`}
            />
          </button>
        ))}
      </div>

      {/* Current Mood Info */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-center"
      >
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
          Currently viewing:{" "}
          <span className={`font-bold bg-gradient-to-r ${currentMood.color} bg-clip-text text-transparent`}>
            {currentMood.label}
          </span>
        </p>
      </motion.div>
    </div>
  );
};
