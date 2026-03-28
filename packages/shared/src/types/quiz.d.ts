export interface Quiz {
    id: number;
    title: string;
    description: string | null;
    teacherId: number;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    durationMinutes: number | null;
    totalMarks: number;
    instructions: string | null;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    autoSubmit: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Question {
    id: number;
    quizId: number;
    questionText: string;
    questionType: string;
    questionOrder: number;
    marks: number;
    correctAnswer: string | null;
    explanation: string | null;
    createdAt: Date;
}
export interface QuestionOption {
    id: number;
    questionId: number;
    optionText: string;
    optionOrder: number;
    isCorrect: boolean;
    createdAt: Date;
}
export interface QuizBatch {
    id: number;
    quizId: number;
    batchId: number;
    assignedAt: Date;
}
export interface QuizSubmission {
    id: number;
    quizId: number;
    studentId: number;
    status: string;
    startedAt: Date | null;
    submittedAt: Date | null;
    timeTakenMinutes: number | null;
    totalScore: number;
    maxScore: number;
    percentage: number;
    autoSavedData: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface StudentAnswer {
    id: number;
    submissionId: number;
    questionId: number;
    answerText: string | null;
    selectedOptions: number[] | null;
    marksAwarded: number;
    isCorrect: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface QuizReminderSent {
    id: number;
    quizId: number;
    sentAt: Date;
    createdAt: Date;
}
//# sourceMappingURL=quiz.d.ts.map