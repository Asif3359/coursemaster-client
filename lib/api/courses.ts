import { apiCall } from "./client";

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  instructor?: string;
  category?: string;
  tags?: string;
  sort?: "price_asc" | "price_desc";
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string | { username: string; email: string };
  price: number;
  category?: string;
  tags?: string[];
  syllabus?: Array<{
    lessonId: string;
    title: string;
    videoUrl?: string;
    content?: string;
  }>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const coursesApi = {
  async getCourses(filters?: CourseFilters) {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.instructor) params.append("instructor", filters.instructor);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.tags) params.append("tags", filters.tags);
    if (filters?.sort) params.append("sort", filters.sort);

    return apiCall<{ items: Course[]; pagination: Pagination }>(
      `/courses/courses?${params.toString()}`
    );
  },

  async getCourseById(id: string) {
    return apiCall<{
      course: Course;
      batches: Array<{
        _id: string;
        name: string;
        startDate: string;
        endDate: string;
        capacity?: number;
        isActive: boolean;
      }>;
    }>(`/courses/courses/${id}`);
  },
};

