// Points Badge Component - displays user's current points balance

import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PointsBadgeProps {
  points: number;
  className?: string;
}

export function PointsBadge({ points, className = "" }: PointsBadgeProps) {
  const [prevPoints, setPrevPoints] = useState(points);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (points !== prevPoints && prevPoints !== 0) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
    setPrevPoints(points);
  }, [points, prevPoints]);

  return (
    <Badge
      variant="secondary"
      className={`gap-2 px-3 py-1.5 font-mono ${className}`}
      data-testid="badge-points"
    >
      <motion.div
        animate={shouldAnimate ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Coins className="w-4 h-4 text-primary" />
      </motion.div>
      <span className="font-semibold">{points.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground">pts</span>
    </Badge>
  );
}
