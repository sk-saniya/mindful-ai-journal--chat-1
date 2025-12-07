"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw, Sparkles } from "lucide-react";

const affirmations = [
  "I am worthy of love and respect",
  "Today, I choose peace and happiness",
  "I trust in my ability to overcome challenges",
  "I am growing and learning every day",
  "My mental health is a priority",
  "I deserve to take time for myself",
  "I am strong, capable, and resilient",
  "I choose to focus on what I can control",
  "Every day is a new opportunity",
  "I am proud of how far I've come",
  "I release what no longer serves me",
  "My feelings are valid and important",
  "I am creating a life I love",
  "I embrace my authentic self",
  "I am enough, just as I am",
  "Peace begins with me",
  "I trust the journey of my life",
  "I am worthy of good things",
  "Today, I am kind to myself",
  "I choose joy and gratitude",
  "My mind is calm and peaceful",
  "I am in charge of my happiness",
  "I attract positive energy",
  "I am surrounded by love and support",
  "Every breath brings me peace",
];

export const DailyAffirmations = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set initial affirmation
    setCurrentAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
  }, []);

  const getNewAffirmation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
      setCurrentAffirmation(newAffirmation);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 border-0 shadow-xl overflow-hidden relative">
      {/* Background animated gradient overlay */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-500/30 to-indigo-500/30"
      />

      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
        >
          <Sparkles className="h-4 w-4 text-white/50" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            Daily Affirmation
          </h3>
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            <Heart className="h-6 w-6 text-white fill-white" />
          </motion.div>
        </div>

        {/* Affirmation Display */}
        <div className="flex flex-col items-center justify-center py-8 min-h-[200px]">
          <motion.div
            key={currentAffirmation}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: isAnimating ? 0 : 1, 
              y: isAnimating ? -20 : 0,
              scale: isAnimating ? 0.9 : 1
            }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30"
            >
              <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                "{currentAffirmation}"
              </p>
            </motion.div>
          </motion.div>

          {/* Refresh Button */}
          <Button
            onClick={getNewAffirmation}
            disabled={isAnimating}
            size="lg"
            className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 shadow-lg"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isAnimating ? 'animate-spin' : ''}`} />
            New Affirmation
          </Button>
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mt-4 text-center text-white/80 text-sm"
        >
          Take a moment to breathe and reflect on these words
        </motion.div>
      </motion.div>
    </Card>
  );
};
