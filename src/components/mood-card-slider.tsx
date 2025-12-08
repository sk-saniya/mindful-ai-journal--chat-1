"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Smile, Frown, Meh, Zap, Cloud, Heart, Sun, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

    // Improved drag sensitivity
    if (Math.abs(velocity) > 300 || Math.abs(offset) > 80) {
      if (offset > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (offset < 0 && currentIndex < moods.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < moods.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
        <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 font-semibold">
          Drag, swipe, or use arrows to explore different moods
        </p>
      </motion.div>

      {/* Main Card Display with Enhanced Arrow Controls */}
      <div className="relative">
        {/* Left Arrow Control */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20"
        >
          <Button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl border-2 border-gray-300 dark:border-gray-600 disabled:opacity-20 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-all duration-200"
          >
            <ChevronLeft className="h-7 w-7 text-gray-800 dark:text-gray-200" />
          </Button>
        </motion.div>

        {/* Right Arrow Control */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20"
        >
          <Button
            onClick={handleNext}
            disabled={currentIndex === moods.length - 1}
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl border-2 border-gray-300 dark:border-gray-600 disabled:opacity-20 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-all duration-200"
          >
            <ChevronRight className="h-7 w-7 text-gray-800 dark:text-gray-200" />
          </Button>
        </motion.div>

        <div className="relative h-[420px] md:h-[480px] mb-8 overflow-hidden px-20 md:px-24" ref={containerRef}>
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
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
                    scale: isActive ? 1 : 0.75,
                    x: offset * 300,
                    opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.4,
                    rotateY: offset * 12,
                    z: isActive ? 0 : -150,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="absolute w-80 md:w-96"
                  style={{
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div
                    className={`relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden`}
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
                        className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${mood.color} flex items-center justify-center shadow-xl`}
                      >
                        <MoodIcon className="w-12 h-12 text-white" />
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
                        className="text-7xl mb-5 text-center"
                      >
                        {mood.emoji}
                      </motion.div>

                      {/* Label */}
                      <h3
                        className={`text-4xl font-bold mb-4 text-center bg-gradient-to-r ${mood.color} bg-clip-text text-transparent`}
                      >
                        {mood.label}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-800 dark:text-gray-200 text-center text-base font-semibold">
                        {mood.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-3 mb-6">
        {moods.map((mood, index) => (
          <button
            key={mood.id}
            onClick={() => setCurrentIndex(index)}
            className="group relative transition-transform hover:scale-125"
            aria-label={`Go to ${mood.label}`}
          >
            <motion.div
              animate={{
                scale: index === currentIndex ? 1.4 : 1,
                opacity: index === currentIndex ? 1 : 0.5,
              }}
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${mood.color} transition-all shadow-lg`}
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
        className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 max-w-md mx-auto border-2 border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <p className="text-lg text-gray-900 dark:text-gray-100 font-bold">
          Currently viewing:{" "}
          <span className={`font-extrabold bg-gradient-to-r ${currentMood.color} bg-clip-text text-transparent text-xl`}>
            {currentMood.label}
          </span>
        </p>
      </motion.div>
    </div>
  );
};