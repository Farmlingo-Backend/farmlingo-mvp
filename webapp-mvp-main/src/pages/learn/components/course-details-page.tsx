import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { coursesApi } from '@/services/api';
import { CourseDetails } from '@/pages/learn/course-details';
import type { Course } from '@/pages/learn/types/course';

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        navigate('/learn/courses', { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const courseData = await coursesApi.getCourseById(id);
        setCourse(courseData);
      } catch (err) {
        console.error('Failed to fetch course:', err);
        setError('Failed to load course details. Please try again.');
        // Navigate back to courses page after a short delay
        setTimeout(() => navigate('/learn/courses', { replace: true }), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/learn/courses')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => navigate('/learn/courses');

  const handleStartCourse = () => {
    const visited = localStorage.getItem('visitedCourses');
    const visitedSet = new Set<string>(visited ? JSON.parse(visited) : []);
    visitedSet.add(course.course_id);
    localStorage.setItem('visitedCourses', JSON.stringify([...visitedSet]));

    navigate(`/learn/courses/${course.course_id}/lessons`);
  };

  return (
    <CourseDetails
      course={course}
      onBack={handleBack}
      onStartCourse={handleStartCourse}
    />
  );
}
