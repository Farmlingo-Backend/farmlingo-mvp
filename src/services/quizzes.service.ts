import { QuizzesRepository } from '../repositories/quizzes.repository';
import { NewQuiz, NewQuizQuestion, NewQuestionOption, NewQuizAttempt, NewQuizAnswer, quizzes, quiz_questions, question_options, quiz_attempts } from '../db/schema';
import { db } from '../db/dbconfig';
import { eq, and, desc, inArray } from 'drizzle-orm';

export class QuizzesService {
    private quizzesRepo: QuizzesRepository;

    constructor() {
        this.quizzesRepo = new QuizzesRepository();
    }

    /**
     * Create a new quiz
     */
    async createQuiz(data: NewQuiz): Promise<NewQuiz> {
        return await this.quizzesRepo.createQuiz(data);
    }

    /**
     * Get quiz by ID
     */
    async getQuizById(quizId: string): Promise<NewQuiz | undefined> {
        return await this.quizzesRepo.findQuizById(quizId);
    }

    /**
     * Get quiz by lesson ID
     */
    async getQuizByLessonId(lessonId: string): Promise<NewQuiz | undefined> {
        return await this.quizzesRepo.findQuizByLessonId(lessonId);
    }

    /**
     * Update quiz
     */
    async updateQuiz(quizId: string, data: Partial<NewQuiz>): Promise<NewQuiz | undefined> {
        return await this.quizzesRepo.updateQuiz(quizId, data);
    }

    /**
     * Delete quiz
     */
    async deleteQuiz(quizId: string): Promise<NewQuiz | undefined> {
        return await this.quizzesRepo.deleteQuiz(quizId);
    }

    /**
     * Create quiz question
     */
    async createQuestion(data: NewQuizQuestion): Promise<NewQuizQuestion> {
        return await this.quizzesRepo.createQuestion(data);
    }

    /**
     * Get questions by quiz ID
     */
    async getQuestionsByQuizId(quizId: string): Promise<NewQuizQuestion[]> {
        return await this.quizzesRepo.findQuestionsByQuizId(quizId);
    }

    /**
     * Update question
     */
    async updateQuestion(questionId: string, data: Partial<NewQuizQuestion>): Promise<NewQuizQuestion | undefined> {
        return await this.quizzesRepo.updateQuestion(questionId, data);
    }

    /**
     * Delete question
     */
    async deleteQuestion(questionId: string): Promise<NewQuizQuestion | undefined> {
        return await this.quizzesRepo.deleteQuestion(questionId);
    }

    /**
     * Create question option
     */
    async createOption(data: NewQuestionOption): Promise<NewQuestionOption> {
        return await this.quizzesRepo.createOption(data);
    }

    /**
     * Get options by question ID
     */
    async getOptionsByQuestionId(questionId: string): Promise<NewQuestionOption[]> {
        return await this.quizzesRepo.findOptionsByQuestionId(questionId);
    }

    /**
     * Update option
     */
    async updateOption(optionId: string, data: Partial<NewQuestionOption>): Promise<NewQuestionOption | undefined> {
        return await this.quizzesRepo.updateOption(optionId, data);
    }

    /**
     * Delete option
     */
    async deleteOption(optionId: string): Promise<NewQuestionOption | undefined> {
        return await this.quizzesRepo.deleteOption(optionId);
    }

    /**
     * Create quiz attempt
     */
    async createAttempt(data: NewQuizAttempt): Promise<NewQuizAttempt> {
        return await this.quizzesRepo.createAttempt(data);
    }

    /**
     * Get attempts by enrollment ID and quiz ID
     */
    async getAttemptsByEnrollmentAndQuiz(enrollmentId: string, quizId: string): Promise<NewQuizAttempt[]> {
        return await this.quizzesRepo.findAttemptsByEnrollmentAndQuiz(enrollmentId, quizId);
    }

    /**
     * Get latest attempt by enrollment ID and quiz ID
     */
    async getLatestAttemptByEnrollmentAndQuiz(enrollmentId: string, quizId: string): Promise<NewQuizAttempt | undefined> {
        return await this.quizzesRepo.findLatestAttemptByEnrollmentAndQuiz(enrollmentId, quizId);
    }

    /**
     * Update attempt
     */
    async updateAttempt(attemptId: string, data: Partial<NewQuizAttempt>): Promise<NewQuizAttempt | undefined> {
        return await this.quizzesRepo.updateAttempt(attemptId, data);
    }

    /**
     * Create quiz answer
     */
    async createAnswer(data: NewQuizAnswer): Promise<NewQuizAnswer> {
        return await this.quizzesRepo.createAnswer(data);
    }

    /**
     * Get answers by attempt ID
     */
    async getAnswersByAttemptId(attemptId: string): Promise<NewQuizAnswer[]> {
        return await this.quizzesRepo.findAnswersByAttemptId(attemptId);
    }

    /**
     * Update answer
     */
    async updateAnswer(answerId: string, data: Partial<NewQuizAnswer>): Promise<NewQuizAnswer | undefined> {
        return await this.quizzesRepo.updateAnswer(answerId, data);
    }

    /**
     * Start a new quiz attempt
     */
    async startQuizAttempt(enrollmentId: string, quizId: string): Promise<NewQuizAttempt> {
        try {
            // Get existing attempts to determine attempt number
            const existingAttempts = await this.getAttemptsByEnrollmentAndQuiz(enrollmentId, quizId);
            const attemptNumber = existingAttempts.length + 1;

            const attempt: NewQuizAttempt = {
                enrollment_id: enrollmentId,
                quiz_id: quizId,
                attempt_number: attemptNumber,
                started_at: new Date(),
                status: 'in_progress'
            };

            return await this.createAttempt(attempt);
        } catch (error) {
            throw new Error(`Failed to start quiz attempt: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Submit quiz answers
     */
    async submitQuizAnswers(attemptId: string, answers: Array<{
        question_id: string;
        selected_options: any[];
    }>): Promise<{
        attempt: NewQuizAttempt;
        score: number;
        totalPoints: number;
        percentage: number;
        passed: boolean;
    }> {
        try {
            // Get the attempt
            const attempt = await this.getQuizAttemptById(attemptId);

            if (!attempt) {
                throw new Error('Quiz attempt not found');
            }

            // Get the quiz for passing score
            const quiz = await this.getQuizById(attempt.quiz_id);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            // Calculate scores and create answers
            let totalPoints = 0;
            let earnedPoints = 0;

            for (const answerData of answers) {
                // Get question details
                const question = await db.select().from(quiz_questions)
                    .where(eq(quiz_questions.question_id, answerData.question_id))
                    .limit(1);

                if (question.length === 0) continue;

                const questionPoints = question[0].points || 0;
                totalPoints += questionPoints;

                // Check if answer is correct
                let isCorrect = false;
                let pointsEarned = 0;

                if (question[0].question_type === 'multiple_choice') {
                    // For multiple choice, check if selected option is correct
                    const selectedOption = await db.select().from(question_options)
                        .where(and(
                            eq(question_options.question_id, answerData.question_id),
                            eq(question_options.option_id, answerData.selected_options[0])
                        ))
                        .limit(1);

                    if (selectedOption.length > 0 && selectedOption[0].is_correct) {
                        isCorrect = true;
                        pointsEarned = questionPoints;
                    }
                } else if (question[0].question_type === 'true_false') {
                    // For true/false, check if selected option matches correct answer
                    const selectedOption = await db.select().from(question_options)
                        .where(and(
                            eq(question_options.question_id, answerData.question_id),
                            eq(question_options.option_text, answerData.selected_options[0])
                        ))
                        .limit(1);

                    if (selectedOption.length > 0 && selectedOption[0].is_correct) {
                        isCorrect = true;
                        pointsEarned = questionPoints;
                    }
                } else if (question[0].question_type === 'multiple_answer') {
                    // For multiple answer, check if all selected options are correct
                    const correctOptions = await db.select().from(question_options)
                        .where(and(
                            eq(question_options.question_id, answerData.question_id),
                            eq(question_options.is_correct, true)
                        ));

                    const selectedOptions = await db.select().from(question_options)
                        .where(and(
                            eq(question_options.question_id, answerData.question_id),
                            inArray(question_options.option_id, answerData.selected_options)
                        ));

                    // Check if all correct options are selected and no incorrect options are selected
                    const allCorrectSelected = correctOptions.every(option =>
                        answerData.selected_options.includes(option.option_id)
                    );
                    const noIncorrectSelected = selectedOptions.every(option => option.is_correct);

                    if (allCorrectSelected && noIncorrectSelected) {
                        isCorrect = true;
                        pointsEarned = questionPoints;
                    }
                }

                earnedPoints += pointsEarned;

                // Create answer record
                await this.createAnswer({
                    attempt_id: attemptId,
                    question_id: answerData.question_id,
                    selected_options: answerData.selected_options,
                    is_correct: isCorrect,
                    points_earned: pointsEarned,
                    time_taken_seconds: 0, // Could be calculated from frontend
                    answered_at: new Date()
                });
            }

            // Update attempt status and scores
            const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
            const passed = percentage >= (quiz.passing_score_percentage || 0);

            await this.updateAttempt(attemptId, {
                score_percentage: percentage,
                score_points: earnedPoints,
                total_points: totalPoints,
                completed_at: new Date(),
                status: 'completed',
                passed: passed
            });

            return {
                attempt: await this.getQuizAttemptById(attemptId),
                score: earnedPoints,
                totalPoints,
                percentage,
                passed
            };
        } catch (error) {
            throw new Error(`Failed to submit quiz answers: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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
        return await this.quizzesRepo.getQuizResults(enrollmentId, quizId);
    }

    /**
     * Get quiz attempt by ID
     */
    async getQuizAttemptById(attemptId: string): Promise<NewQuizAttempt> {
        const [attempt] = await db.select().from(quiz_attempts).where(eq(quiz_attempts.attempt_id, attemptId));
        if (!attempt) {
            throw new Error('Quiz attempt not found');
        }
        return attempt;
    }

    /**
     * Get quiz statistics
     */
    async getQuizStatistics(quizId: string): Promise<{
        totalAttempts: number;
        averageScore: number;
        passRate: number;
        highestScore: number;
        lowestScore: number;
    }> {
        try {
            const attempts = await this.getAttemptsByEnrollmentAndQuiz('', quizId);
            
            if (attempts.length === 0) {
                return {
                    totalAttempts: 0,
                    averageScore: 0,
                    passRate: 0,
                    highestScore: 0,
                    lowestScore: 0
                };
            }

            const totalAttempts = attempts.length;
            const averageScore = attempts.reduce((sum, attempt) => sum + (attempt.score_percentage || 0), 0) / totalAttempts;
            const passRate = (attempts.filter(attempt => attempt.passed).length / totalAttempts) * 100;
            const highestScore = Math.max(...attempts.map(attempt => attempt.score_percentage || 0));
            const lowestScore = Math.min(...attempts.map(attempt => attempt.score_percentage || 0));

            return {
                totalAttempts,
                averageScore,
                passRate,
                highestScore,
                lowestScore
            };
        } catch (error) {
            throw new Error(`Failed to get quiz statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const quizzesService = new QuizzesService();
