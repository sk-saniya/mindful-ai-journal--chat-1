"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MessageCircle, Heart, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const CrisisSupport = () => {
  const handleCall = (number: string) => {
    toast.info(`Emergency hotline: ${number}`);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500"
          >
            <AlertTriangle className="h-6 w-6 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Crisis Support
          </h3>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          If you're experiencing a mental health crisis, you're not alone. Help is available 24/7.
        </p>

        <div className="space-y-3">
          {/* National Suicide Prevention Lifeline */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-red-200 dark:border-red-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-500" />
                  <span>Crisis Text Line</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Text HOME to 741741
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall("741741")}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Crisis Text Line */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-red-200 dark:border-red-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-red-500" />
                  <span>Suicide Prevention Lifeline</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Call 988 or 1-800-273-8255
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall("988")}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Emergency Services */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-red-200 dark:border-red-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Emergency Services</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Immediate danger - Call 911
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCall("911")}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg"
        >
          <div className="flex items-start space-x-3">
            <Heart className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Remember:</strong> It's okay to ask for help. These feelings are temporary, and support is available.
              </p>
            </div>
          </div>
        </motion.div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => window.open("https://www.samhsa.gov/find-help/national-helpline", "_blank")}
        >
          Find More Resources
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </Card>
  );
};
