import { apiCall } from "../client";
import { Assignment, AssignmentSubmission } from "../assignments";

export interface CreateAssignmentData {
  courseId: string;
  batchId?: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate?: string;
}

export interface ReviewSubmissionData {
  status?: string;
  feedback?: string;
  grade?: number;
}

export const adminAssignmentsApi = {
  async createAssignment(data: CreateAssignmentData) {
    return apiCall<{ assignment: Assignment }>("/assignments/admin/assignments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAssignment(assignmentId: string, data: Partial<CreateAssignmentData>) {
    return apiCall<{ assignment: Assignment }>(`/assignments/admin/assignments/${assignmentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAssignment(assignmentId: string) {
    return apiCall(`/assignments/admin/assignments/${assignmentId}`, {
      method: "DELETE",
    });
  },

  async getAssignmentsForCourse(courseId: string) {
    return apiCall<Assignment[]>(`/assignments/admin/courses/${courseId}/assignments`);
  },

  async getSubmissionsForAssignment(assignmentId: string) {
    return apiCall<AssignmentSubmission[]>(
      `/assignments/admin/assignments/${assignmentId}/submissions`
    );
  },

  async getSubmissionsForCourse(courseId: string) {
    return apiCall<AssignmentSubmission[]>(`/assignments/admin/courses/${courseId}/submissions`);
  },

  async reviewSubmission(submissionId: string, data: ReviewSubmissionData) {
    return apiCall<{ submission: AssignmentSubmission }>(
      `/assignments/admin/submissions/${submissionId}/review`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },
};

