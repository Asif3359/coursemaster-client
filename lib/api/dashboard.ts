import { apiCall } from "./client";
import { Enrollment } from "./enrollments";

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export const dashboardApi = {
  async getEnrollments() {
    return apiCall<Enrollment[]>("/dashboard/dashboard/enrollments");
  },

  async getCourseProgress(courseId: string) {
    return apiCall<CourseProgress>(`/dashboard/dashboard/courses/${courseId}/progress`);
  },
};

