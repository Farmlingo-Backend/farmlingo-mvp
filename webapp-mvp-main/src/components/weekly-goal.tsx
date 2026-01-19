// WeeklyGoalCard.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WeeklyGoalCardProps {
  completedLessons: number;
  totalLessons: number;
}

const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = ({
  completedLessons = 3,
  totalLessons = 5,
}) => {
  const progress = Math.min(
    100,
    Math.round((completedLessons / totalLessons) * 100)
  );
  const remaining = totalLessons - completedLessons;
  const goalMessage =
    remaining > 0
      ? `${remaining} more lesson${
          remaining !== 1 ? "s" : ""
        } to reach your goal!`
      : "Goal achieved!";

  return (
    <Card className="bg-green-600 text-white rounded-lg shadow-none w-full">
      {" "}
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl font-bold">Weekly Goal</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {completedLessons} of {totalLessons} lessons
          </span>
          <span className="font-medium">{progress}%</span>
        </div>

        <div className="h-2 w-full bg-white rounded-full overflow-hidden">
          <Progress
            value={progress}
            className="h-full rounded-none"
            indicatorClassName="bg-green-800"
          />
        </div>

        <p className="text-sm">{goalMessage}</p>
      </CardContent>
    </Card>
  );
};

export default WeeklyGoalCard;
