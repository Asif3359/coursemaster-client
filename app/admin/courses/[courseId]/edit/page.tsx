"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { coursesApi } from "@/lib/api/courses";
import { adminCoursesApi } from "@/lib/api/admin/courses";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    price: "",
    category: "",
    tags: "",
    syllabus: [] as Array<{ lessonId: string; title: string; videoUrl?: string; content?: string }>,
  });

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    loadCourse();
  }, [token, user, router, params.courseId]);

  async function loadCourse() {
    try {
      const response = await coursesApi.getCourseById(params.courseId as string);
      if (response.data?.course) {
        const courseData = response.data.course;
        setCourse(courseData);
        setFormData({
          title: courseData.title || "",
          description: courseData.description || "",
          instructor: typeof courseData.instructor === "object" 
            ? courseData.instructor.email || courseData.instructor.username || ""
            : courseData.instructor || "",
          price: courseData.price?.toString() || "",
          category: courseData.category || "",
          tags: Array.isArray(courseData.tags) ? courseData.tags.join(", ") : courseData.tags || "",
          syllabus: courseData.syllabus || [],
        });
      }
    } catch (err) {
      console.error("Failed to load course:", err);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    if (formData.title.length > 200) {
      toast.error("Title must be less than 200 characters");
      return;
    }
    if (formData.description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Price must be a valid number ≥ 0");
      return;
    }
    
    // Validate syllabus items if any exist
    for (const lesson of formData.syllabus) {
      if (lesson.lessonId && !lesson.title) {
        toast.error("Lesson title is required if lesson ID is provided");
        return;
      }
      if (lesson.title && !lesson.lessonId) {
        toast.error("Lesson ID is required if lesson title is provided");
        return;
      }
    }
    
    setSubmitting(true);
    try {
      // Process tags - can be comma-separated string or array
      let tagsValue: string[] = [];
      if (formData.tags.trim()) {
        tagsValue = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      
      // Process syllabus - only include lessons with both lessonId and title
      const validSyllabus = formData.syllabus.filter(
        lesson => lesson.lessonId && lesson.title
      );
      
      // Build request body according to API spec
      const requestBody: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructor: formData.instructor.trim(),
        price: priceNum,
      };
      
      // Only include optional fields if they have values
      if (formData.category.trim()) {
        requestBody.category = formData.category.trim();
      }
      if (tagsValue.length > 0) {
        requestBody.tags = tagsValue;
      }
      if (validSyllabus.length > 0) {
        requestBody.syllabus = validSyllabus.map(lesson => ({
          lessonId: lesson.lessonId,
          title: lesson.title,
          ...(lesson.videoUrl && { videoUrl: lesson.videoUrl }),
          ...(lesson.content && { content: lesson.content }),
        }));
      }
      
      const response = await adminCoursesApi.updateCourse(params.courseId as string, requestBody);
      if (response.data) {
        toast.success("Course updated successfully");
        router.push("/admin/courses");
      } else {
        toast.error(response.message || "Failed to update course");
      }
    } catch (err: any) {
      console.error("Update course error:", err);
      toast.error(err.message || "Failed to update course. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || user?.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-600 text-lg">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6 text-6xl">📚</div>
            <h1 className="text-3xl font-bold mb-3 text-slate-900">Course not found</h1>
            <p className="text-slate-600 mb-6 text-lg">
              The course you're trying to edit doesn't exist.
            </p>
            <Link 
              href="/admin/courses"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Courses
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Link
            href="/admin/courses"
            className="inline-flex items-center text-white/90 hover:text-white mb-4 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Edit Course
            </h1>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="text-white text-sm font-medium">{course.title}</span>
            </div>
          </div>
          <p className="text-white/90">
            Update course details and information
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border-2 border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
                minLength={3}
                maxLength={200}
                placeholder="Course title (3-200 characters)"
              />
              <p className="text-xs text-slate-500 mt-1.5">{formData.title.length}/200 characters</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border-2 border-slate-200 pl-8 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Must be &gt;= 0</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-2 border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              required
              minLength={10}
              placeholder="Course description (minimum 10 characters)"
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-1.5">Minimum 10 characters</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Instructor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full border-2 border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                required
                placeholder="Email, username, or ObjectId"
              />
              <p className="text-xs text-slate-500 mt-1.5">Can be email, username, or ObjectId</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border-2 border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="e.g., programming, web-development"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tags <span className="text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full border-2 border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="Comma-separated tags, e.g., react, frontend, javascript"
            />
            <p className="text-xs text-slate-500 mt-1.5">Separate tags with commas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Syllabus (Lessons) <span className="text-slate-400">(Optional)</span>
            </label>
            <p className="text-xs text-slate-500 mb-4">Add lessons to the course. Both Lesson ID and Title are required for each lesson.</p>
            <div className="space-y-3">
              {formData.syllabus.map((lesson, idx) => (
                <div key={idx} className="border-2 border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Lesson {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSyllabus = formData.syllabus.filter((_, i) => i !== idx);
                        setFormData({ ...formData, syllabus: newSyllabus });
                      }}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Lesson ID *"
                      value={lesson.lessonId}
                      onChange={(e) => {
                        const newSyllabus = [...formData.syllabus];
                        newSyllabus[idx].lessonId = e.target.value;
                        setFormData({ ...formData, syllabus: newSyllabus });
                      }}
                      className="border-2 border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required={!!lesson.title}
                    />
                    <input
                      type="text"
                      placeholder="Lesson Title *"
                      value={lesson.title}
                      onChange={(e) => {
                        const newSyllabus = [...formData.syllabus];
                        newSyllabus[idx].title = e.target.value;
                        setFormData({ ...formData, syllabus: newSyllabus });
                      }}
                      className="border-2 border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required={!!lesson.lessonId}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Video URL (optional)"
                      value={lesson.videoUrl || ""}
                      onChange={(e) => {
                        const newSyllabus = [...formData.syllabus];
                        newSyllabus[idx].videoUrl = e.target.value;
                        setFormData({ ...formData, syllabus: newSyllabus });
                      }}
                      className="border-2 border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <textarea
                      placeholder="Content (optional)"
                      value={lesson.content || ""}
                      onChange={(e) => {
                        const newSyllabus = [...formData.syllabus];
                        newSyllabus[idx].content = e.target.value;
                        setFormData({ ...formData, syllabus: newSyllabus });
                      }}
                      className="border-2 border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    syllabus: [...formData.syllabus, { lessonId: "", title: "", videoUrl: "", content: "" }],
                  });
                }}
                className="w-full px-4 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-colors border-2 border-indigo-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Lesson
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex gap-4">
            <Button 
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {submitting ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Course
                </>
              )}
            </Button>
            <Link href="/admin/courses">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-3 border-2 border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

