import { apiCall } from "./client";

export interface Enrollment {
  _id: string;
  student: {
    username: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
    price: number;
  };
  batch: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  status: string;
  paymentStatus: string;
  enrolledAt: string;
}

export interface EnrollData {
  courseId: string;
  batchId: string;
  paymentStatus?: string;
}

export const enrollmentsApi = {
  async enroll(data: EnrollData) {
    return apiCall<{ enrollment: Enrollment }>("/enrollments/enroll", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

