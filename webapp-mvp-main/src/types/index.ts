export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  modules: number;
  hours: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  price: number;
  instructor: string;
  learningPath: string;
  progress?: number;
}
 