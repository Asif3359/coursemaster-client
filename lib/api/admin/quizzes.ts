import { apiCall } from "../client";
import { Quiz, QuizQuestion, CreateQuizData } from "../quizzes";

export const adminQuizzesApi = {
  async createQuiz(data: CreateQuizData) {
    return apiCall<{ data: Quiz }>("/quizzes/admin/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateQuiz(quizId: string, data: Partial<CreateQuizData>) {
    return apiCall<{ data: Quiz }>(`/quizzes/admin/quizzes/${quizId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteQuiz(quizId: string) {
    return apiCall(`/quizzes/admin/quizzes/${quizId}`, {
      method: "DELETE",
    });
  },

  async getQuizzesForCourse(courseId: string) {
    // Note: Backend doesn't have this endpoint, but we can fetch from course
    // For now, return empty array or implement if backend adds it
    return apiCall<Quiz[]>(`/quizzes/admin/courses/${courseId}/quizzes`).catch(() => ({
      data: [] as Quiz[],
    }));
  },
};
