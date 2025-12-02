"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { coursesApi } from "@/lib/api/courses";
import { adminCoursesApi } from "@/lib/api/admin/courses";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import Link from "next/link";

export default function AdminCoursesPage() {
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!token || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    loadCourses();
  }, [token, user, router, mounted]);

  async function loadCourses() {
    try {
      const response = await coursesApi.getCourses({ limit: 100 });
      if (response.data) {
        setCourses(response.data.items || []);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  }


  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminCoursesApi.deleteCourse(deleteTarget);
      setDeleteTarget(null);
      loadCourses();
      toast.success("Course deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  if (!token || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Manage Courses
              </h1>
              <p className="text-white/90">
                Create, edit, and manage all courses in the platform
              </p>
            </div>
            <Link href="/admin/courses/new">
              <Button className="bg-white text-indigo-600 hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <p className="text-slate-600 text-lg">Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No courses yet</h2>
            <p className="text-slate-600 mb-6">
              Create your first course to get started
            </p>
            <Link href="/admin/courses/new">
              <Button>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Course
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                All Courses ({courses.length})
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Course Header */}
                  <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-4xl font-bold opacity-20">
                        {course.title?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                    </div>
                    {course.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold rounded-full">
                          {course.category}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3">
                      <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md">
                        <span className="text-xl font-bold text-indigo-700">${course.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap w-full">
                        <Link className="flex-1 w-full" href={`/admin/courses/${course._id}/edit`}>
                          <Button className="flex w-full bg-green-600 hover:bg-green-700 text-sm py-2">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDelete(course._id)}
                          className="bg-red-600 hover:bg-red-700 text-sm py-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/admin/courses/${course._id}/batches`}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium text-center transition-colors"
                        >
                          Batches
                        </Link>
                        <Link
                          href={`/admin/courses/${course._id}/assignments`}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium text-center transition-colors"
                        >
                          Assignments
                        </Link>
                        <Link
                          href={`/admin/courses/${course._id}/quizzes`}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium text-center transition-colors"
                        >
                          Quizzes
                        </Link>
                        <Link
                          href={`/admin/courses/${course._id}/enrollments`}
                          className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-xs font-medium text-center transition-colors"
                        >
                          Enrollments
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete course?"
        description="This action cannot be undone. The course and related content may no longer be accessible to students."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

