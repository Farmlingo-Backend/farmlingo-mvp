import { useState, useEffect } from "react";
import { Header } from "@/pages/learn/components/courses-leader-header";
import { CourseCard } from "@/pages/learn/components/course-item";
import { CourseDetails } from "@/pages/learn/course-details";
import { coursesApi } from "@/services/api";
import type { Course } from "@/pages/learn/types/course";

function App() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await coursesApi.getCourses();
        setCourses(response.data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleStartCourse = (courseId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.course_id === courseId ? { ...course, progress: 16 } : course
      )
    );
    setSelectedCourse(null);
  };

  const filteredCourses = courses
    .filter((course) => {
      if (activeTab === "progress") {
        return course.progress !== undefined;
      }
      return true;
    })
    .filter((course) => {
      if (selectedPath === "all") return true;
      return course.learningPath === selectedPath;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-white p-6">
        <CourseDetails
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
          onStartCourse={() => handleStartCourse(selectedCourse.course_id)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPath={selectedPath}
        setSelectedPath={setSelectedPath}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.course_id}
            course={course}
            onClick={() => setSelectedCourse(course)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
