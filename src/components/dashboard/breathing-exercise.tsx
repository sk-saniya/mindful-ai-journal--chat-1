"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const techniques = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Inhale, hold, exhale, hold - 4 seconds each",
    steps: [
      { text: "Inhale", duration: 4000, color: "from-blue-400 to-cyan-400" },
      { text: "Hold", duration: 4000, color: "from-purple-400 to-pink-400" },
      { text: "Exhale", duration: 4000, color: "from-green-400 to-emerald-400" },
      { text: "Hold", duration: 4000, color: "from-orange-400 to-red-400" },
    ],
  },
  {
    id: "4-7-8",
    name: "4-7-8 Technique",
    description: "Inhale 4s, hold 7s, exhale 8s",
    steps: [
      { text: "Inhale", duration: 4000, color: "from-blue-400 to-cyan-400" },
      { text: "Hold", duration: 7000, color: "from-purple-400 to-pink-400" },
      { text: "Exhale", duration: 8000, color: "from-green-400 to-emerald-400" },
    ],
  },
  {
    id: "calm",
    name: "Calm Breathing",
    description: "Simple inhale 4s, exhale 6s",
    steps: [
      { text: "Inhale", duration: 4000, color: "from-blue-400 to-cyan-400" },
      { text: "Exhale", duration: 6000, color: "from-green-400 to-emerald-400" },
    ],
  },
];

export const BreathingExercise = () => {
  const [selectedTechnique, setSelectedTechnique] = useState(techniques[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isActive) {
      const step = selectedTechnique.steps[currentStep];
      const startTime = Date.now();

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / step.duration) * 100, 100);
        setProgress(currentProgress);
      }, 50);

      interval = setTimeout(() => {
        const nextStep = (currentStep + 1) % selectedTechnique.steps.length;
        setCurrentStep(nextStep);
        setProgress(0);
        setTotalTime((prev) => prev + step.duration);
      }, step.duration);
    }

    return () => {
      clearTimeout(interval);
      clearInterval(progressInterval);
    };
  }, [isActive, currentStep, selectedTechnique]);

  const toggleBreathing = () => {
    setIsActive(!isActive);
  };

  const resetExercise = async () => {
    setIsActive(false);
    setCurrentStep(0);
    setProgress(0);

    // Log breathing session if there was time tracked
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
            technique: selectedTechnique.id,
          }),
        });
        toast.success("Breathing session logged!");
      } catch (error) {
        console.error("Failed to log breathing session:", error);
      }
    }
    
    setTotalTime(0);
  };

  const currentStepData = selectedTechnique.steps[currentStep];

  return (
    <Card className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-gray-200 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2">
            <Wind className="h-6 w-6 text-blue-600" />
            <span>Breathing Exercise</span>
          </h3>
        </div>

        {/* Technique Selector */}
        <div className="flex space-x-2 mb-6">
          {techniques.map((technique) => (
            <Button
              key={technique.id}
              variant={selectedTechnique.id === technique.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedTechnique(technique);
                resetExercise();
              }}
              className={
                selectedTechnique.id === technique.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : ""
              }
            >
              {technique.name}
            </Button>
          ))}
        </div>

        {/* Breathing Circle */}
        <div className="flex flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: isActive
                    ? currentStepData.text === "Inhale"
                      ? [1, 1.3]
                      : currentStepData.text === "Exhale"
                      ? [1.3, 1]
                      : [1.3, 1.3]
                    : 1,
                }}
                transition={{
                  duration: currentStepData.duration / 1000,
                  ease: "easeInOut",
                }}
                className={`w-48 h-48 rounded-full bg-gradient-to-br ${currentStepData.color} shadow-2xl flex items-center justify-center`}
              >
                <div className="text-center">
                  <p className="text-white text-2xl font-bold mb-2">
                    {currentStepData.text}
                  </p>
                  {isActive && (
                    <p className="text-white/90 text-sm">
                      {Math.ceil((currentStepData.duration - (progress * currentStepData.duration) / 100) / 1000)}s
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Progress Ring */}
              {isActive && (
                <svg
                  className="absolute top-0 left-0 w-48 h-48 -rotate-90"
                  style={{ filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))" }}
                >
                  <circle
                    cx="96"
                    cy="96"
                    r="92"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 92}`}
                    strokeDashoffset={`${2 * Math.PI * 92 * (1 - progress / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.05s linear" }}
                  />
                </svg>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="text-gray-600 dark:text-gray-400 text-center mt-6 max-w-xs">
            {selectedTechnique.description}
          </p>

          {totalTime > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Session: {Math.floor(totalTime / 1000)}s
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={toggleBreathing}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button onClick={resetExercise} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>
      </motion.div>
    </Card>
  );
};
