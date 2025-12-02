import { apiCall } from "../client";
import { Enrollment } from "../enrollments";

export const adminEnrollmentsApi = {
  async getEnrollmentsForCourse(courseId: string) {
    return apiCall<{ data: Enrollment[] }>(
      `/enrollments/admin/courses/${courseId}/enrollments`,
      {
        method: "GET",
      }
    );
  },

  async getEnrollmentsForBatch(batchId: string) {
    return apiCall<{ data: Enrollment[] }>(
      `/enrollments/admin/batches/${batchId}/enrollments`,
      {
        method: "GET",
      }
    );
  },

  async getEnrollmentsForCourseAndBatch(courseId: string, batchId: string) {
    return apiCall<{ data: Enrollment[] }>(
      `/enrollments/admin/courses/${courseId}/batches/${batchId}/enrollments`,
      {
        method: "GET",
      }
    );
  },
};


