"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { dashboardApi } from "@/lib/api/dashboard";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.push("/login?redirect=/dashboard");
      return;
    }

    async function loadEnrollments() {
      try {
        const response = await dashboardApi.getEnrollments();
        if (response.data) {
          setEnrollments(response.data);
        }
      } catch (err) {
        console.error("Failed to load enrollments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEnrollments();
  }, [mounted, token, router]);

  // Load course progress for each enrolled course
  useEffect(() => {
    if (!mounted || !token) return;
    if (!enrollments || enrollments.length === 0) return;

    async function loadProgress() {
      try {
        setLoadingProgress(true);
        const courseIds = Array.from(
          new Set(
            enrollments
              .map((enrollment: any) =>
                typeof enrollment.course === "string"
                  ? enrollment.course
                  : enrollment.course?._id
              )
              .filter(Boolean)
          )
        ) as string[];

        const results = await Promise.all(
          courseIds.map(async (courseId) => {
            try {
              const res = await dashboardApi.getCourseProgress(courseId);
              return { courseId, data: res.data || res };
            } catch {
              return { courseId, data: null };
            }
          })
        );

        const map: Record<string, any> = {};
        results.forEach(({ courseId, data }) => {
          if (data) map[courseId] = data;
        });
        setProgressMap(map);
      } finally {
        setLoadingProgress(false);
      }
    }

    loadProgress();
  }, [mounted, token, enrollments]);

  if (!mounted || !token) return null;

  // Calculate overall statistics
  const totalCourses = enrollments.length;
  const totalProgress = Object.values(progressMap).reduce((sum: number, p: any) => {
    return sum + (p?.percentage || 0);
  }, 0);
  const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
  const completedCourses = Object.values(progressMap).filter((p: any) => p?.percentage === 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back{user?.username ? `, ${user.username}` : ''}!
            </h1>
            <p className="text-white/90 text-lg">
              Continue your learning journey
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <p className="text-slate-600 text-lg">Loading your courses...</p>
            </div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 mb-6">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No courses yet</h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Browse our course catalog to get started!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Courses
            </Link>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Total Courses</p>
                    <p className="text-3xl font-bold text-slate-900">{totalCourses}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Average Progress</p>
                    <p className="text-3xl font-bold text-slate-900">{averageProgress}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-slate-900">{completedCourses}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Cards */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                My Courses
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((enrollment: any) => {
                  const course =
                    typeof enrollment.course === "string"
                      ? null
                      : enrollment.course;
                  if (!course) return null;
                  const progress = progressMap[course._id];
                  const progressPercentage = progress?.percentage || 0;
                  
                  return (
                    <div
                      key={enrollment._id}
                      className="group bg-white rounded-2xl shadow-sm border-2 border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Course Header with Gradient */}
                      <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white text-4xl font-bold opacity-20 group-hover:opacity-30 transition-opacity">
                            {course.title?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                        </div>
                        {course.category && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold rounded-full shadow-sm">
                              {course.category}
                            </span>
                          </div>
                        )}
                        {progressPercentage === 100 && (
                          <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                          {course.title}
                        </h3>

                        {/* Progress Section */}
                        {progress ? (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-700">Progress</span>
                              <span className="text-sm font-bold text-indigo-600">{progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <p className="mt-2 text-xs text-slate-600">
                              {progress.completedLessons} of {progress.totalLessons} lessons completed
                            </p>
                          </div>
                        ) : loadingProgress ? (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                              Loading progress...
                            </div>
                          </div>
                        ) : null}

                        {/* Action Button */}
                        <Link
                          href={`/courses/${course._id}/learn`}
                          className="inline-flex items-center justify-center w-full px-5 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md group-hover:shadow-indigo-200"
                        >
                          {progressPercentage === 100 ? (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Review Course
                            </>
                          ) : progressPercentage > 0 ? (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Continue Learning
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Start Learning
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
