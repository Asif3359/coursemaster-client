"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { assignmentsApi } from "@/lib/api/assignments";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    answerText: "",
    googleDriveLink: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.push("/login");
      return;
    }

    loadAssignment();
  }, [token, router, params.assignmentId, mounted]);

  async function loadAssignment() {
    try {
      // Fetch assignment details - get from course assignments list (student endpoint)
      try {
        const assignmentsRes = await assignmentsApi.getAssignmentsForCourse(params.id as string);
        // Handle both response formats: { assignments: [...] } or { data: [...] }
        const assignmentsList = (assignmentsRes as any).assignments || (assignmentsRes as any).data || [];
        const foundAssignment = assignmentsList.find(
          (a: any) => a._id === params.assignmentId
        );
        if (foundAssignment) {
          setAssignment(foundAssignment);
        }
      } catch (err) {
        console.error("Could not fetch assignment:", err);
      }
    } catch (err) {
      console.error("Failed to load assignment:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.answerText.trim() && !formData.googleDriveLink.trim()) {
      toast.error("Please provide either an answer text or a Google Drive link");
      return;
    }

    setSubmitting(true);
    try {
      const response = await assignmentsApi.submitAssignment(
        params.assignmentId as string,
        {
          answerText: formData.answerText.trim() || undefined,
          googleDriveLink: formData.googleDriveLink.trim() || undefined,
        }
      );

      if (response.data) {
        toast.success("Assignment submitted successfully!");
        // Set submission state to show submitted view
        setSubmission(response.data.submission || response.data);
        // Reload to get updated assignment info if needed
        loadAssignment();
      } else {
        toast.error(response.message || "Failed to submit assignment");
      }
    } catch (err: any) {
      // Handle duplicate submission error (409)
      if (err.message && (err.message.includes("already submitted") || err.message.includes("409"))) {
        toast.error("You have already submitted this assignment. Contact admin to update.");
        // Optionally reload to check if we can get submission details
      } else {
        toast.error(err.message || "Failed to submit assignment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-600 text-lg">Loading assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6 text-6xl">📝</div>
            <h1 className="text-3xl font-bold mb-3 text-slate-900">Assignment not found</h1>
            <p className="text-slate-600 mb-6 text-lg">
              The assignment you're looking for doesn't exist.
            </p>
            <Link 
              href={`/courses/${params.id}/learn`}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Link
            href={`/courses/${params.id}/learn`}
            className="inline-flex items-center text-white/90 hover:text-white mb-4 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Course
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                {assignment.title}
              </h1>
              {assignment.dueDate && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center text-white/90">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {isOverdue && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Description Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Assignment Description
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
              {assignment.description}
            </p>
          </div>
        </div>

        {submission ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your Submission
              </h2>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  submission.status === "reviewed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center text-slate-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
              {submission.grade !== null && submission.grade !== undefined && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-lg font-bold text-indigo-600">
                    Grade: {submission.grade}/100
                  </span>
                </div>
              )}
            </div>

            {submission.answerText && (
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Your Answer
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {submission.answerText}
                </p>
              </div>
            )}

            {submission.googleDriveLink && (
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h3 className="font-semibold text-lg text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Google Drive Link
                </h3>
                <Link
                  href={submission.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium break-all"
                >
                  {submission.googleDriveLink}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}

            {submission.feedback && (
              <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
                <h3 className="font-semibold text-lg text-indigo-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Instructor Feedback
                </h3>
                <p className="text-indigo-900 leading-relaxed whitespace-pre-wrap">
                  {submission.feedback}
                </p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center mb-2">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Submit Assignment
              </h2>
              <p className="text-slate-600 mt-2">
                Provide either a text answer or a Google Drive link (or both).
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Answer Text (Optional)
              </label>
              <textarea
                value={formData.answerText}
                onChange={(e) =>
                  setFormData({ ...formData, answerText: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-slate-700"
                rows={10}
                placeholder="Type your answer here..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Google Drive Link (Optional)
              </label>
              <input
                type="url"
                value={formData.googleDriveLink}
                onChange={(e) =>
                  setFormData({ ...formData, googleDriveLink: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {submitting ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Assignment
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

