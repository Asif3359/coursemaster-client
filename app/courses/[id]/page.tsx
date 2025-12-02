"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { coursesApi } from "@/lib/api/courses";
import { enrollmentsApi } from "@/lib/api/enrollments";
import { dashboardApi } from "@/lib/api/dashboard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [course, setCourse] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      try {
        setError(null);
        const response = await coursesApi.getCourseById(params.id as string);
        console.log("Course API Response:", response);
        if (response.data) {
          setCourse(response.data.course);
          setBatches(response.data.batches || []);
          if (response.data.batches?.length === 1) {
            setSelectedBatch(response.data.batches[0]._id);
          }
        } else {
          setError("Course not found - no data in response");
        }
      } catch (err: any) {
        console.error("Failed to load course:", err);
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [params.id]);

  useEffect(() => {
    async function checkEnrollment() {
      if (!token || !params.id) return;

      setCheckingEnrollment(true);
      try {
        const response = await dashboardApi.getEnrollments();
        if (response.data) {
          const enrolled = response.data.some((enrollment: any) => {
            const courseId =
              typeof enrollment.course === "string"
                ? enrollment.course
                : enrollment.course?._id;
            return courseId === params.id;
          });
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Failed to check enrollment:", err);
      } finally {
        setCheckingEnrollment(false);
      }
    }
    checkEnrollment();
  }, [token, params.id]);

  const handleEnroll = async () => {
    if (!token) {
      router.push(`/login?redirect=/courses/${params.id}`);
      return;
    }

    // Validate courseId
    const courseId = params.id as string;
    if (!courseId) {
      toast.error("Invalid course ID");
      return;
    }

    // Determine batchId - must be provided
    let batchId = selectedBatch;

    // If no batch selected but batches exist, use first batch
    if (!batchId && batches.length > 0) {
      batchId = batches[0]._id;
    }

    // Validate batchId
    if (!batchId || batchId.trim() === "") {
      if (batches.length === 0) {
        toast.error(
          "No batches available for this course. Please contact the administrator."
        );
        return;
      }
      toast.error("Please select a batch");
      return;
    }

    try {
      console.log("Enrolling with:", { courseId, batchId });
      const response = await enrollmentsApi.enroll({
        courseId: courseId,
        batchId: batchId,
      });

      console.log("Enrollment response:", response);
      if (response.data) {
        setIsEnrolled(true);
        toast.success("Enrolled successfully!");
        // Optionally redirect to dashboard or stay on page
        // router.push("/dashboard");
      } else {
        toast.error(response.message || "Enrollment failed");
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
      toast.error(err.message || "Enrollment failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-600 text-lg">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6 text-6xl">😕</div>
            <h1 className="text-3xl font-bold mb-3 text-slate-900">
              Course not found
            </h1>
            <p className="text-slate-600 mb-6 text-lg">
              {error || "The course you're looking for doesn't exist."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go back to courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            {/* Category Badge */}
            {course.category && (
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-4 border border-white/30">
                {course.category}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {course.title}
            </h1>

            {/* Instructor & Price */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center text-white/90">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {typeof course.instructor === "string"
                    ? course.instructor
                    : course.instructor?.username ||
                      course.instructor?.email ||
                      "N/A"}
                </span>
              </div>
              <div className="flex items-center text-white">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-3xl font-bold">${course.price}</span>
              </div>
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                About This Course
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg">
                {course.description}
              </p>
            </div>

            {/* Syllabus Card */}
            {course.syllabus && course.syllabus.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Course Syllabus
                </h2>
                <div className="space-y-3">
                  {course.syllabus.map((lesson: any, index: number) => (
                    <div
                      key={lesson.lessonId}
                      className="flex items-start p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                          {lesson.title}
                        </h3>
                        {lesson.content && (
                          <p className="text-sm text-slate-600">
                            {lesson.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
              {/* Price Display */}
              <div className="text-center mb-6 pb-6 border-b border-slate-200">
                <div className="text-sm text-slate-600 mb-2">Course Price</div>
                <div className="text-4xl font-bold text-indigo-600">
                  ${course.price}
                </div>
              </div>

              {/* Batch Selection */}
              {batches.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Select Batch *
                  </label>
                  <select
                    value={selectedBatch || batches[0]?._id || ""}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm hover:border-indigo-400"
                    required
                  >
                    <option value="">-- Select a batch --</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name} -{" "}
                        {new Date(batch.startDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-1">
                        No batches available
                      </p>
                      <p className="text-xs text-amber-700 mb-3">
                        Students cannot enroll until a batch is created.
                      </p>
                      {user?.role === "admin" && (
                        <Link
                          href={`/admin/courses/${params.id}/batches`}
                          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Create batch →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enrollment Actions */}
              {token ? (
                <div className="space-y-3">
                  {checkingEnrollment ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mb-2"></div>
                      <p className="text-sm text-slate-600">
                        Checking enrollment...
                      </p>
                    </div>
                  ) : isEnrolled ? (
                    <>
                      <Button
                        disabled
                        className="w-full bg-green-600 hover:bg-green-600 cursor-not-allowed text-white py-3 text-base font-semibold shadow-md"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Enrolled
                      </Button>
                      <Link
                        href={`/courses/${params.id}/learn`}
                        className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700 text-base font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Continue Learning
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleEnroll}
                        className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Enroll Now
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleEnroll}
                  className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login to Enroll
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
