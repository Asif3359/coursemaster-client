import { apiCall } from "../client";
import { Course } from "../courses";

export interface CreateCourseData {
  title: string;
  description: string;
  instructor: string;
  price: number | string;
  category?: string;
  tags?: string[] | string;
  syllabus?: Array<{
    lessonId: string;
    title: string;
    videoUrl?: string;
    content?: string;
  }>;
  isActive?: boolean;
}

export const adminCoursesApi = {
  async createCourse(data: CreateCourseData) {
    return apiCall<{ course: Course }>("/courses/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateCourse(id: string, data: Partial<CreateCourseData>) {
    return apiCall<{ course: Course }>(`/courses/admin/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteCourse(id: string) {
    return apiCall(`/courses/admin/courses/${id}`, {
      method: "DELETE",
    });
  },
};

