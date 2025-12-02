import { apiCall } from "./client";

export interface Assignment {
  _id: string;
  course: string;
  batch?: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate?: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: Assignment;
  student: {
    username: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
  answerText?: string;
  googleDriveLink?: string;
  status: string;
  feedback?: string;
  grade?: number;
  submittedAt: string;
}

export interface SubmitAssignmentData {
  answerText?: string;
  googleDriveLink?: string;
}

export const assignmentsApi = {
  async submitAssignment(assignmentId: string, data: SubmitAssignmentData) {
    return apiCall<{ submission: AssignmentSubmission }>(
      // Router is mounted at /api/assignments and student route is
      // router.post("/assignments/:assignmentId/submit", ...)
      // → final path: /api/assignments/assignments/:assignmentId/submit
      `/assignments/assignments/${assignmentId}/submit`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
  async getAssignmentsForCourse(courseId: string) {
    return apiCall<{ assignments: Assignment[] } | { data: Assignment[] }>(
      // Student route: router.get("/assignments/courses/:courseId", ...)
      // Mounted at /api/assignments → /api/assignments/assignments/courses/:courseId
      `/assignments/assignments/courses/${courseId}`,
      {
        method: "GET",
      }
    );
  },
};

