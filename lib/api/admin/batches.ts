import { apiCall } from "../client";

export interface Batch {
  _id: string;
  course: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity?: number;
  isActive: boolean;
}

export interface CreateBatchData {
  name: string;
  startDate: string;
  endDate: string;
  capacity?: number;
  isActive?: boolean;
}

export const adminBatchesApi = {
  async createBatch(courseId: string, data: CreateBatchData) {
    return apiCall<{ batch: Batch }>(`/courses/admin/courses/${courseId}/batches`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateBatch(batchId: string, data: Partial<CreateBatchData>) {
    return apiCall<{ batch: Batch }>(`/courses/admin/batches/${batchId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteBatch(batchId: string) {
    return apiCall(`/courses/admin/batches/${batchId}`, {
      method: "DELETE",
    });
  },

  async getBatchesForCourse(courseId: string) {
    return apiCall<Batch[]>(`/courses/admin/courses/${courseId}/batches`);
  },
};

