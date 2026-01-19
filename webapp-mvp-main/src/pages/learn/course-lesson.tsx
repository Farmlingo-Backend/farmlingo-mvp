// import React, { useMemo } from 'react';
// import { FileText, PlayCircle } from 'lucide-react';
// import { useNavigate, useParams, Link, useLocation } from 'react-router';
// import { dummyCourses } from './constant/courses';
// import type { Course, Lesson } from './types/course';
// import { PageHeader } from '@/components/page-header';
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from '@/components/ui/breadcrumb';

// const CourseLessonsPage: React.FC = () => {
//   const { id: courseId } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get lessonId if passed from state
//   const initialLessonId: string | undefined = location.state?.lessonId;

//   // find course by id
//   const course: Course | undefined = useMemo(
//     () => dummyCourses.find((c) => c.courseId === courseId),
//     [courseId]
//   );

//   if (!course) {
//     return (
//       <div className='min-h-screen bg-green-50 flex items-center justify-center p-6'>
//         <div className='max-w-xl bg-white rounded-lg p-8 shadow text-center'>
//           <h2 className='text-xl font-semibold mb-2'>Course not found</h2>
//           <p className='text-gray-600 mb-4'>
//             We couldn't locate that course. You can return to the course
//             catalog.
//           </p>
//           <Link
//             to='/courses'
//             className='inline-block px-4 py-2 bg-green-600 text-white rounded-lg'
//           >
//             Back to Courses
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const selectedLesson: Lesson | undefined = initialLessonId
//     ? course.lessons.find((l) => l.lessonId === initialLessonId)
//     : course.lessons[0];

//   return (
//     <div className='min-h-screen bg-gray-50'>
//       <PageHeader
//         breadcrumb={
//           <Breadcrumb>
//             <BreadcrumbList>
//               <BreadcrumbItem className='hidden md:block'>
//                 <BreadcrumbLink asChild>
//                   <Link to={`/learn/courses/${course.courseId}`}>
//                     {course.title}
//                   </Link>
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator className='hidden md:block' />
//               <BreadcrumbItem>
//                 <BreadcrumbPage>
//                   {selectedLesson ? selectedLesson.title : 'Lesson'}
//                 </BreadcrumbPage>
//               </BreadcrumbItem>
//             </BreadcrumbList>
//           </Breadcrumb>
//         }
//       />

//       {/* MAIN */}
//       <div className='max-w-6xl mx-auto px-6 flex flex-col gap-8'>
//         {/* VIDEO / LESSON PLAYER */}
//         <section className='md:col-span-2 bg-white rounded-lg shadow-sm p-6'>
//           {selectedLesson ? (
//             <>
//               {selectedLesson.videoUrl ? (
//                 <div className='aspect-video mb-6 rounded-lg overflow-hidden bg-black flex items-center justify-center'>
//                   {selectedLesson.videoUrl.includes('youtube.com') ? (
//                     <iframe
//                       src={selectedLesson.videoUrl}
//                       title={selectedLesson.title}
//                       allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
//                       allowFullScreen
//                       className='w-full h-full'
//                     />
//                   ) : (
//                     <video
//                       src={selectedLesson.videoUrl}
//                       controls
//                       className='w-full h-full'
//                     />
//                   )}
//                 </div>
//               ) : (
//                 <div className='aspect-video bg-gray-200 flex items-center justify-center rounded-lg mb-6'>
//                   <PlayCircle className='w-16 h-16 text-green-600' />
//                 </div>
//               )}
//               <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
//                 {selectedLesson.title}
//               </h2>
//               <p className='text-gray-600'>{selectedLesson.shortDescription}</p>
//             </>
//           ) : (
//             <p className='text-gray-600'>Select a lesson to get started.</p>
//           )}
//         </section>

//         {/* RESOURCES SECTION */}
//         {selectedLesson &&
//           selectedLesson.resources &&
//           selectedLesson.resources.length > 0 && (
//             <div className='mt-6'>
//               <h3 className='text-lg font-semibold text-gray-900 mb-4'>
//                 Resources
//               </h3>
//               <ul className='space-y-3'>
//                 {selectedLesson.resources.map((res, idx) => (
//                   <li key={idx}>
//                     <a
//                       href={res.url}
//                       target='_blank'
//                       rel='noopener noreferrer'
//                       className='flex items-center gap-2 text-green-700 hover:underline'
//                     >
//                       {/* Different icon depending on type */}
//                       {res.type === 'pdf' ? (
//                         <FileText className='w-5 h-5 text-red-500' />
//                       ) : (
//                         <PlayCircle className='w-5 h-5 text-green-600' />
//                       )}
//                       {res.title}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//         {/* LESSON LIST */}
//         <aside className='bg-white rounded-lg shadow-sm p-6'>
//           <h3 className='text-lg font-semibold text-gray-900 mb-4'>
//             Course Lesson
//           </h3>
//           <ul className='divide-y'>
//             {course.lessons.map((lesson) => (
//               <li
//                 key={lesson.lessonId}
//                 className={`p-3 rounded-md cursor-pointer flex items-center gap-3 transition ${
//                   selectedLesson?.lessonId === lesson.lessonId
//                     ? 'bg-green-50 border-l-4 border-green-600'
//                     : 'hover:bg-gray-50'
//                 }`}
//                 onClick={() =>
//                   navigate(`/learn/courses/${course.courseId}/lessons`, {
//                     state: { lessonId: lesson.lessonId },
//                   })
//                 }
//               >
//                 <PlayCircle className='w-5 h-5 text-green-600 flex-shrink-0' />
//                 <div>
//                   <div className='font-medium text-gray-800'>
//                     {lesson.title}
//                   </div>
//                   <div className='text-sm text-gray-500'>{lesson.duration}</div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default CourseLessonsPage;



export default function courselesson() {
  return (
    <div></div>
  )
}
