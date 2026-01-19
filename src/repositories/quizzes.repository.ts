import { db } from '../db/dbconfig';
import { 
    quizzes, 
    quiz_questions, 
    question_options, 
    quiz_attempts, 
    quiz_answers,
    NewQuiz, 
    NewQuizQuestion, 
    NewQuestionOption, 
    NewQuizAttempt, 
    NewQuizAnswer 
} from '../db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export class QuizzesRepository {
    /**
     * Create a new quiz
     */
    async createQuiz(data: NewQuiz): Promise<NewQuiz> {
        const [quiz] = await db.insert(quizzes).values(data).returning();
        return quiz;
    }

    /**
     * Get quiz by ID
     */
    async findQuizById(quizId: string): Promise<NewQuiz | undefined> {
        const [quiz] = await db.select().from(quizzes).where(eq(quizzes.quiz_id, quizId));
        return quiz;
    }

    /**
     * Get quiz by lesson ID
     */
    async findQuizByLessonId(lessonId: string): Promise<NewQuiz | undefined> {
        const [quiz] = await db.select().from(quizzes).where(eq(quizzes.lesson_id, lessonId));
        return quiz;
    }

    /**
     * Update quiz
     */
    async updateQuiz(quizId: string, data: Partial<NewQuiz>): Promise<NewQuiz | undefined> {
        const [quiz] = await db.update(quizzes)
            .set({ ...data, updated_at: new Date() })
            .where(eq(quizzes.quiz_id, quizId))
            .returning();
        return quiz;
    }

    /**
     * Delete quiz
     */
    async deleteQuiz(quizId: string): Promise<NewQuiz | undefined> {
        const [quiz] = await db.delete(quizzes)
            .where(eq(quizzes.quiz_id, quizId))
            .returning();
        return quiz;
    }

    /**
     * Create quiz question
     */
    async createQuestion(data: NewQuizQuestion): Promise<NewQuizQuestion> {
        const [question] = await db.insert(quiz_questions).values(data).returning();
        return question;
    }

    /**
     * Get questions by quiz ID
     */
    async findQuestionsByQuizId(quizId: string): Promise<NewQuizQuestion[]> {
        const questions = await db.select()
            .from(quiz_questions)
            .where(eq(quiz_questions.quiz_id, quizId))
            .orderBy(quiz_questions.order_number);
        return questions;
    }

    /**
     * Update question
     */
    async updateQuestion(questionId: string, data: Partial<NewQuizQuestion>): Promise<NewQuizQuestion | undefined> {
        const [question] = await db.update(quiz_questions)
            .set({ ...data })
            .where(eq(quiz_questions.question_id, questionId))
            .returning();
        return question;
    }

    /**
     * Delete question
     */
    async deleteQuestion(questionId: string): Promise<NewQuizQuestion | undefined> {
        const [question] = await db.delete(quiz_questions)
            .where(eq(quiz_questions.question_id, questionId))
            .returning();
        return question;
    }

    /**
     * Create question option
     */
    async createOption(data: NewQuestionOption): Promise<NewQuestionOption> {
        const [option] = await db.insert(question_options).values(data).returning();
        return option;
    }

    /**
     * Get options by question ID
     */
    async findOptionsByQuestionId(questionId: string): Promise<NewQuestionOption[]> {
        const options = await db.select()
            .from(question_options)
            .where(eq(question_options.question_id, questionId))
            .orderBy(question_options.order_number);
        return options;
    }

    /**
     * Update option
     */
    async updateOption(optionId: string, data: Partial<NewQuestionOption>): Promise<NewQuestionOption | undefined> {
        const [option] = await db.update(question_options)
            .set({ ...data })
            .where(eq(question_options.option_id, optionId))
            .returning();
        return option;
    }

    /**
     * Delete option
     */
    async deleteOption(optionId: string): Promise<NewQuestionOption | undefined> {
        const [option] = await db.delete(question_options)
            .where(eq(question_options.option_id, optionId))
            .returning();
        return option;
    }

    /**
     * Create quiz attempt
     */
    async createAttempt(data: NewQuizAttempt): Promise<NewQuizAttempt> {
        const [attempt] = await db.insert(quiz_attempts).values(data).returning();
        return attempt;
    }

    /**
     * Get attempts by enrollment ID and quiz ID
     */
    async findAttemptsByEnrollmentAndQuiz(enrollmentId: string, quizId: string): Promise<NewQuizAttempt[]> {
        const attempts = await db.select()
            .from(quiz_attempts)
            .where(and(
                eq(quiz_attempts.enrollment_id, enrollmentId),
                eq(quiz_attempts.quiz_id, quizId)
            ))
            .orderBy(desc(quiz_attempts.attempt_number));
        return attempts;
    }

    /**
     * Get latest attempt by enrollment ID and quiz ID
     */
    async findLatestAttemptByEnrollmentAndQuiz(enrollmentId: string, quizId: string): Promise<NewQuizAttempt | undefined> {
        const [attempt] = await db.select()
            .from(quiz_attempts)
            .where(and(
                eq(quiz_attempts.enrollment_id, enrollmentId),
                eq(quiz_attempts.quiz_id, quizId)
            ))
            .orderBy(desc(quiz_attempts.attempt_number))
            .limit(1);
        return attempt;
    }

    /**
     * Update attempt
     */
    async updateAttempt(attemptId: string, data: Partial<NewQuizAttempt>): Promise<NewQuizAttempt | undefined> {
        const [attempt] = await db.update(quiz_attempts)
            .set({ ...data })
            .where(eq(quiz_attempts.attempt_id, attemptId))
            .returning();
        return attempt;
    }

    /**
     * Create quiz answer
     */
    async createAnswer(data: NewQuizAnswer): Promise<NewQuizAnswer> {
        const [answer] = await db.insert(quiz_answers).values(data).returning();
        return answer;
    }

    /**
     * Get answers by attempt ID
     */
    async findAnswersByAttemptId(attemptId: string): Promise<NewQuizAnswer[]> {
        const answers = await db.select()
            .from(quiz_answers)
            .where(eq(quiz_answers.attempt_id, attemptId));
        return answers;
    }

    /**
     * Update answer
     */
    async updateAnswer(answerId: string, data: Partial<NewQuizAnswer>): Promise<NewQuizAnswer | undefined> {
        const [answer] = await db.update(quiz_answers)
            .set({ ...data })
            .where(eq(quiz_answers.answer_id, answerId))
            .returning();
        return answer;
    }

    /**
     * Get quiz results for a user
     */
    async getQuizResults(enrollmentId: string, quizId: string): Promise<{
        quiz: NewQuiz;
        questions: (NewQuizQuestion & { options: NewQuestionOption[] })[];
        attempts: NewQuizAttempt[];
        latestAttempt: NewQuizAttempt | undefined;
        answers: NewQuizAnswer[];
    }> {
        const quiz = await this.findQuizByLessonId(quizId);
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        if (!quiz.quiz_id) {
            throw new Error('Quiz ID is required');
        }

        const actualQuizId = quiz.quiz_id!;

        const questions = await this.findQuestionsByQuizId(actualQuizId);
        const attempts = await this.findAttemptsByEnrollmentAndQuiz(enrollmentId, actualQuizId);
        const latestAttempt = await this.findLatestAttemptByEnrollmentAndQuiz(enrollmentId, actualQuizId);
        const answers = latestAttempt ? await this.findAnswersByAttemptId(latestAttempt.attempt_id!) : [];

        // Get options for each question
        const questionsWithOptions = await Promise.all(
            questions.map(async (question) => {
                if (!question.question_id) return { ...question, options: [] };
                const options = await this.findOptionsByQuestionId(question.question_id);
                return { ...question, options };
            })
        );

        return {
            quiz,
            questions: questionsWithOptions,
            attempts,
            latestAttempt,
            answers
        };
    }

    /**
     * Calculate quiz score
     */
    async calculateQuizScore(attemptId: string): Promise<{
        attempt: NewQuizAttempt;
        answers: NewQuizAnswer[];
        score: number;
        totalPoints: number;
        percentage: number;
        passed: boolean;
    }> {
        const [attempt] = await db.select().from(quiz_attempts).where(eq(quiz_attempts.attempt_id, attemptId));
        if (!attempt) {
            throw new Error('Attempt not found');
        }

        const answers = await this.findAnswersByAttemptId(attemptId);
        
        let score = 0;
        let totalPoints = 0;

        for (const answer of answers) {
            const question = await db.select().from(quiz_questions)
                .where(eq(quiz_questions.question_id, answer.question_id))
                .limit(1);
            
            if (question.length > 0) {
                totalPoints += question[0].points || 0;
                
                if (answer.is_correct) {
                    score += question[0].points || 0;
                }
            }
        }

        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        const passed = percentage >= (attempt.score_percentage || 0);

        return {
            attempt,
            answers,
            score,
            totalPoints,
            percentage,
            passed
        };
    }
}
