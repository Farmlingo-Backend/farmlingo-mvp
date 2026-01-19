// export interface Quiz {
//   quizId: string;
//   questions: Question[];
// }

// export interface Question {
//   question: string;
//   alternatives: Record<'a' | 'b' | 'c' | 'd', Alternative>;
// }

// export interface Alternative {
//   text: string;
//   isCorrect: boolean;
// }

// src/types/quiz.ts

export interface Quiz {
  quizId: string;
  questions: Question[];
}

export interface Question {
  question: string;
  alternatives: Record<'a' | 'b' | 'c' | 'd', Alternative>;
}

export interface Alternative {
  text: string;
  isCorrect: boolean;
}