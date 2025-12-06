"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [totalTime, setTotalTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      const durations = {
        inhale: 4000,
        hold: 2000,
        exhale: 6000,
      };
      
      interval = setTimeout(() => {
        if (currentPhase === "inhale") {
          setCurrentPhase("hold");
        } else if (currentPhase === "hold") {
          setCurrentPhase("exhale");
        } else {
          setCurrentPhase("inhale");
          setCycleCount((prev) => prev + 1);
        }
        setTotalTime((prev) => prev + durations[currentPhase]);
      }, durations[currentPhase]);
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
          toast.success(`Breathing session completed! ${cycleCount} cycles.`);
        } catch (error) {
          console.error("Failed to log breathing session:", error);
        }
      }
      
      setTotalTime(0);
      setCycleCount(0);
      setCurrentPhase("inhale");
    } else {
      // Start
      setIsActive(true);
    }
  };

  const getCircleScale = () => {
    if (!isActive) return 1;
    if (currentPhase === "inhale") return [1, 1.6];
    if (currentPhase === "hold") return [1.6, 1.6];
    return [1.6, 1];
  };

  const getPhaseDuration = () => {
    if (currentPhase === "inhale") return 4;
    if (currentPhase === "hold") return 2;
    return 6;
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 border-0 shadow-xl overflow-hidden relative">
      {/* Background animated gradient overlay */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-purple-500/30 to-pink-500/30"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            Breathing Exercise
          </h3>
          <motion.div
            animate={{ rotate: isActive ? 360 : 0 }}
            transition={{ duration: 12, repeat: isActive ? Infinity : 0, ease: "linear" }}
          >
            <Wind className="h-6 w-6 text-white" />
          </motion.div>
        </div>

        {/* Main Breathing Circle */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer glow rings */}
            <motion.div
              animate={{
                scale: isActive ? [1, 1.2, 1] : 1,
                opacity: isActive ? [0.3, 0.6, 0.3] : 0.3,
              }}
              transition={{
                duration: getPhaseDuration(),
                repeat: isActive ? Infinity : 0,
              }}
              className="absolute w-full h-full rounded-full bg-white/20 blur-xl"
            />

            {/* Middle ring */}
            <motion.div
              animate={{
                scale: getCircleScale(),
              }}
              transition={{
                duration: getPhaseDuration(),
                ease: "easeInOut",
              }}
              className="absolute w-48 h-48 rounded-full bg-white/30 backdrop-blur-sm"
            />

            {/* Inner animated circle */}
            <motion.div
              animate={{
                scale: getCircleScale(),
              }}
              transition={{
                duration: getPhaseDuration(),
                ease: "easeInOut",
              }}
              className="absolute w-36 h-36 rounded-full bg-white/50 backdrop-blur-md shadow-2xl flex items-center justify-center"
            >
              {/* Center content */}
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentPhase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white text-2xl font-bold capitalize"
                  >
                    {currentPhase}
                  </motion.p>
                </AnimatePresence>
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/80 text-sm mt-1"
                  >
                    {cycleCount} cycles
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Particles effect */}
            {isActive && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [0, Math.cos((i * Math.PI * 2) / 8) * 100],
                      y: [0, Math.sin((i * Math.PI * 2) / 8) * 100],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="absolute w-2 h-2 rounded-full bg-white"
                  />
                ))}
              </>
            )}
          </div>

          {/* Phase indicator text */}
          <motion.p
            key={currentPhase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-white/90 text-center text-sm"
          >
            {currentPhase === "inhale" && "Breathe in slowly through your nose"}
            {currentPhase === "hold" && "Hold your breath gently"}
            {currentPhase === "exhale" && "Breathe out slowly through your mouth"}
          </motion.p>
        </div>

        {/* Control Button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={toggleBreathing}
            size="lg"
            className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-10 shadow-lg"
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Stop Exercise
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start Exercise
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        {totalTime > 0 && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-white/80 text-sm"
          >
            Last session: {Math.floor(totalTime / 1000)}s • {cycleCount} cycles
          </motion.div>
        )}
      </motion.div>
    </Card>
  );
};