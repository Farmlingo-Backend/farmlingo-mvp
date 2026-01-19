import { Clock, Folder } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "../types/course";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const getLevelColor = (level: string | undefined) => {
    switch (level) {
      case "Beginner":
        return "bg-black text-white";
      case "Intermediate":
        return "bg-blue-50 text-blue-700";
      case "Advanced":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 50) return "bg-red-500";
    if (progress < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative w-full h-50 overflow-hidden bg-gray-100">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover object-center rounded-t-lg"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-base text-gray-900 mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {course.description}
          </p>

          {course.progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">
                  Progress: {course.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressColor(
                    course.progress
                  )}`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Folder size={12} />
              <span>{course.modules} Modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{course.hours} Hours</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getLevelColor(
                  course.level
                )}`}
              >
                {course.level}
              </span>
              <span className="text-xs px-2 py-1 border border-gray-300 rounded-full text-gray-700">
                {course.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">${course.price}</p>
              {/* <p className="text-xs text-gray-500">{course.instructor}</p> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
