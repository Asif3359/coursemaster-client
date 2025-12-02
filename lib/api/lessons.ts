import { apiCall } from "./client";
import { CourseProgress } from "./dashboard";

export interface Lesson {
  lessonId: string;
  title: string;
  videoUrl?: string;
  content?: string;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface CourseContent {
  courseId: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const lessonsApi = {
  async getCourseContent(courseId: string) {
    return apiCall<CourseContent>(`/lessons/${courseId}/content`);
  },

  async markLessonComplete(courseId: string, lessonId: string) {
    return apiCall<{
      progress: {
        _id: string;
        student: string;
        course: string;
        lessonId: string;
        isCompleted: boolean;
        completedAt: string;
      };
      courseProgress: CourseProgress;
    }>(`/lessons/${courseId}/lessons/${lessonId}/complete`, {
      method: "POST",
    });
  },
};

