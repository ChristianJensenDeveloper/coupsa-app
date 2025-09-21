import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Hand } from "lucide-react";

export function SwipeInstructions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6 p-4 bg-muted/50 rounded-lg border border-border"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Hand className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm font-medium">How to use</p>
      </div>
      <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-red-500" />
          <span>Swipe left to dismiss</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-green-500" />
          <span>Swipe right to claim</span>
        </div>
      </div>
    </motion.div>
  );
}