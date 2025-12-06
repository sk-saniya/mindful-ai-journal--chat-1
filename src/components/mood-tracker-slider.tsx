"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Frown, Meh, Heart, Zap, Moon, Sun, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const moods = [
  {
    id: "anxious",
    label: "Anxious",
    icon: Cloud,
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-800",
  },
  {
    id: "calm",
    label: "Calm",
    icon: Moon,
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "happy",
    label: "Happy",
    icon: Smile,
    color: "from-yellow-400 to-orange-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    id: "sad",
    label: "Sad",
    icon: Frown,
    color: "from-indigo-400 to-purple-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    id: "stressed",
    label: "Stressed",
    icon: Zap,
    color: "from-red-400 to-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  {
    id: "peaceful",
    label: "Peaceful",
    icon: Heart,
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    id: "energetic",
    label: "Energetic",
    icon: Sun,
    color: "from-amber-400 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    id: "tired",
    label: "Tired",
    icon: Meh,
    color: "from-slate-400 to-slate-600",
    bgColor: "bg-slate-50 dark:bg-slate-800",
  },
];

export const MoodTrackerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = moods.length - 1;
      if (nextIndex >= moods.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const currentMood = moods[currentIndex];
  const MoodIcon = currentMood.icon;

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          How are you feeling today?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Swipe or click to explore different moods
        </p>
      </motion.div>

      <div className="relative h-[400px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
          >
            <Card
              className={`${currentMood.bgColor} border-2 p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="flex flex-col items-center space-y-6"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className={`p-8 rounded-full bg-gradient-to-br ${currentMood.color} shadow-lg`}
                >
                  <MoodIcon className="h-20 w-20 text-white" strokeWidth={2} />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-3xl font-bold bg-gradient-to-br ${currentMood.color} bg-clip-text text-transparent`}
                >
                  {currentMood.label}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 dark:text-gray-400 text-center"
                >
                  Track your {currentMood.label.toLowerCase()} moments and gain insights
                  into your emotional patterns
                </motion.p>
              </motion.div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: [-3, 0, -3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ←
          </motion.span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: [3, 0, 3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            →
          </motion.span>
        </Button>
      </div>

      {/* Mood Indicators */}
      <div className="flex justify-center space-x-2 mt-8">
        {moods.map((mood, index) => (
          <button
            key={mood.id}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-gradient-to-r " + mood.color
                : "w-2 bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
