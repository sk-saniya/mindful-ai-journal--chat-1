"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2">
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
            >
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            </motion.span>
            <span>for mindful living</span>
          </p>
          <span className="hidden md:inline text-gray-400 dark:text-gray-600 mx-3">•</span>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Mindful AI Journal. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
