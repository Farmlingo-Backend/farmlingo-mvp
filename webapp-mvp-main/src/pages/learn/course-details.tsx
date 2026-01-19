import { ArrowLeft, Clock, FolderOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "@/pages/learn/types/course";

interface CourseDetailsProps {
  course: Course;
  onBack: () => void;
  onStartCourse: () => void;
}

export function CourseDetails({ course, onBack, onStartCourse }: CourseDetailsProps) {
  const getLevelColor = (level: string | undefined) => {
    switch (level) {
      case 'Beginner':
        return 'bg-black text-white';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-900';
      case 'Advanced':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={20} />
        Back to Courses
      </Button>

      <Card className="overflow-hidden">
        <div className="relative">
          <img 
            src={course.image} 
            alt={course.title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <Button 
              size="lg"
              onClick={onStartCourse}
              className="bg-white text-black hover:bg-gray-100 flex items-center gap-2"
            >
              <Play size={24} />
              Start Course
            </Button>
          </div>
        </div>

        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-gray-600 text-lg">{course.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-300">
                  {course.category}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">${course.price}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <FolderOpen className="mx-auto mb-2 text-blue-600" size={32} />
                <p className="font-semibold text-lg">{course.modules}</p>
                <p className="text-gray-600 text-sm">Modules</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="mx-auto mb-2 text-blue-600" size={32} />
                <p className="font-semibold text-lg">{course.hours}</p>
                <p className="text-gray-600 text-sm">Hours</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            {[...Array(course.modules)].map((_, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">Module {index + 1}: Introduction to Farming Concepts</p>
                      <p className="text-sm text-gray-600">Duration: 45 minutes</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Start
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
