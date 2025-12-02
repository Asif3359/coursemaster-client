import { apiCall } from "./client";

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  _id: string;
  course: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizForStudent {
  quizId: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: {
    questionText: string;
    options: string[];
  }[];
}

export interface QuizSubmission {
  _id: string;
  quiz: string;
  student: string;
  course: string;
  selectedOptions: number[];
  score: number;
  submittedAt: string;
}

export interface SubmitQuizData {
  selectedOptions: number[];
}

export interface CreateQuizData {
  courseId: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export const quizzesApi = {
  async getQuiz(quizId: string) {
    return apiCall<{ data: QuizForStudent }>(
      `/quizzes/quizzes/${quizId}`,
      {
        method: "GET",
      }
    );
  },

  async submitQuiz(quizId: string, data: SubmitQuizData) {
    return apiCall<{
      data: {
        submission: QuizSubmission;
        score: number;
        correctAnswers: number;
        totalQuestions: number;
      };
    }>(`/quizzes/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getQuizzesForCourse(courseId: string) {
    return apiCall<{ data: Quiz[] }>(
      `/quizzes/courses/${courseId}/quizzes`,
      {
        method: "GET",
      }
    );
  },

  async getQuizSubmission(quizId: string) {
    return apiCall<{
      data: {
        quizId: string;
        quizTitle: string;
        courseId: string;
        lessonId: string;
        submission: {
          score: number;
          correctAnswers: number;
          totalQuestions: number;
          selectedOptions: number[];
          submittedAt: string;
        };
        questions: Array<{
          questionText: string;
          options: string[];
          correctOptionIndex: number;
          studentAnswer: number;
          isCorrect: boolean;
        }>;
      };
    }>(`/quizzes/quizzes/${quizId}/submission`, {
      method: "GET",
    });
  },
};
