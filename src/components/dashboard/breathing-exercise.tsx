"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "exhale">("inhale");
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      const duration = currentPhase === "inhale" ? 4000 : 6000;
      
      interval = setTimeout(() => {
        setCurrentPhase(currentPhase === "inhale" ? "exhale" : "inhale");
        setTotalTime((prev) => prev + duration);
      }, duration);
    }

    return () => {
      clearTimeout(interval);
    };
  }, [isActive, currentPhase]);

  const toggleBreathing = async () => {
    if (isActive) {
      // Stop and log session
      setIsActive(false);
      
      if (totalTime > 0) {
        try {
          const token = localStorage.getItem("bearer_token");
          await fetch("/api/breathing-sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              durationSeconds: Math.floor(totalTime / 1000),
              technique: "calm",
            }),
          });
          toast.success("Breathing session completed!");
        } catch (error) {
          console.error("Failed to log breathing session:", error);
        }
      }
      
      setTotalTime(0);
      setCurrentPhase("inhale");
    } else {
      // Start
      setIsActive(true);
    }
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-400 via-cyan-400 to-green-400 border-0 shadow-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          Breathing Tracker
        </h3>

        {/* Breathing Circle */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                animate={{
                  scale: isActive
                    ? currentPhase === "inhale"
                      ? [1, 1.4, 1.4]
                      : [1.4, 1, 1]
                    : 1,
                }}
                transition={{
                  duration: currentPhase === "inhale" ? 4 : 6,
                  ease: "easeInOut",
                  repeat: 0,
                }}
                className="w-40 h-40 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white/50 shadow-2xl flex items-center justify-center relative"
              >
                {/* Animated circle segments */}
                <svg
                  className="absolute top-0 left-0 w-40 h-40 -rotate-90"
                  style={{ filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))" }}
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="76"
                    stroke="white"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray="60 20"
                    className={isActive ? "animate-spin-slow" : ""}
                    style={{ animationDuration: "8s" }}
                  />
                </svg>

                <div className="text-center z-10">
                  <p className="text-white text-2xl font-bold capitalize">
                    {currentPhase}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Inhale/Exhale Labels */}
            <div className="absolute -left-20 top-1/2 -translate-y-1/2">
              <p className="text-white text-sm font-medium">Inhale</p>
            </div>
            <div className="absolute -right-20 top-1/2 -translate-y-1/2">
              <p className="text-white text-sm font-medium">Exhale</p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={toggleBreathing}
            size="lg"
            className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-8 shadow-lg"
          >
            {isActive ? "Stop Exercise" : "Start Exercise"}
          </Button>
        </div>
      </motion.div>
    </Card>
  );
};