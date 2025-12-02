"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { lessonsApi } from "@/lib/api/lessons";
import { dashboardApi } from "@/lib/api/dashboard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Assignment, assignmentsApi } from "@/lib/api/assignments";
import { quizzesApi } from "@/lib/api/quizzes";
import toast from "react-hot-toast";

export default function CourseLearnPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadCourse() {
      try {
        const [contentRes, progressRes, assignmentsRes, quizzesRes] = await Promise.all([
          lessonsApi.getCourseContent(params.id as string),
          dashboardApi.getCourseProgress(params.id as string),
          assignmentsApi
            .getAssignmentsForCourse(params.id as string)
            .catch(() => ({ data: [] as Assignment[] } as any)),
          quizzesApi
            .getQuizzesForCourse(params.id as string)
            .catch(() => ({ data: [] })),
        ]);

        if (contentRes.data) {
          setCourse(contentRes.data);
          const courseLessons = contentRes.data.lessons || [];
          setLessons(courseLessons);
          // Select first lesson by default
          if (courseLessons.length > 0) {
            const firstLesson = courseLessons[0];
            setSelectedLessonId(firstLesson.lessonId || String(0));
          }
        }
        if (progressRes.data) {
          setProgress(progressRes.data);
        }

        // Handle either { assignments: [...] } or { data: [...] }
        if (assignmentsRes) {
          const anyRes: any = assignmentsRes as any;
          const list: Assignment[] = anyRes.assignments || anyRes.data || [];
          setAssignments(list);
        }
        setQuizzes(quizzesRes.data || []);
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [params.id, token, router, mounted]);

  const handleComplete = async (lessonId: string) => {
    try {
      await lessonsApi.markLessonComplete(params.id as string, lessonId);
      // Reload progress
      const progressRes = await dashboardApi.getCourseProgress(params.id as string);
      if (progressRes.data) {
        setProgress(progressRes.data);
      }
      // Update lesson status
      setLessons((prev) =>
        prev.map((l) => (l.lessonId === lessonId ? { ...l, isCompleted: true } : l))
      );
    } catch (err) {
      toast.error("Failed to mark lesson as complete");
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
            <p className="text-slate-600 text-lg">Loading course content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />
      
      {/* Hero Section with Progress */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              href={`/courses/${params.id}`}
              className="inline-flex items-center text-white/90 hover:text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Course
            </Link>
            {progress && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium">Progress:</span>
                  <span className="text-white font-bold text-lg">{progress.percentage}%</span>
                  <div className="w-24 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-4 leading-tight">
            {course?.title}
          </h1>
        </div>
      </div>

      <main className="flex flex-col lg:flex-row h-[calc(100vh-180px)] lg:h-[calc(100vh-180px)] max-w-[1200px] mx-auto">
        {/* Left Sidebar - Lessons List */}
        <div className="w-full lg:w-80 xl:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto flex-shrink-0 max-h-[300px] lg:max-h-none">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-4 z-10">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lessons ({lessons.length})
            </h2>
          </div>
          <div className="p-2">
            {lessons.map((lesson, idx) => {
              const lessonKey = lesson.lessonId || String(idx);
              const isSelected = selectedLessonId === lessonKey;

              return (
                <button
                  key={lessonKey}
                  type="button"
                  onClick={() => setSelectedLessonId(lessonKey)}
                  className={`w-full text-left p-4 rounded-lg mb-2 transition-all duration-200 ${
                    isSelected
                      ? "bg-indigo-50 border-2 border-indigo-500 shadow-md"
                      : "bg-slate-50 border-2 border-transparent hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      lesson.isCompleted
                        ? "bg-green-500 text-white"
                        : isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-grow min-w-0">
                          <h3 className={`font-semibold text-sm mb-1 ${
                            isSelected ? "text-indigo-900" : "text-slate-900"
                          }`}>
                            {lesson.title}
                          </h3>
                          {lesson.isCompleted && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-medium">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Done
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side - Video and Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {selectedLessonId && (() => {
            const selectedLesson = lessons.find(
              (l, idx) => (l.lessonId || String(idx)) === selectedLessonId
            );
            
            if (!selectedLesson) {
              return (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-600">Select a lesson to begin</p>
                </div>
              );
            }

            const lessonIndex = lessons.findIndex(
              (l, idx) => (l.lessonId || String(idx)) === selectedLessonId
            );
            const lessonAssignments = assignments.filter(
              (a) => a.lessonId === selectedLesson.lessonId
            );
            const lessonQuizzes = quizzes.filter(
              (q) => q.lessonId === selectedLesson.lessonId
            );

            return (
              <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Lesson Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                        {selectedLesson.title}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Lesson {lessonIndex + 1} of {lessons.length}</span>
                        {selectedLesson.isCompleted && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Player */}
                {selectedLesson.videoUrl && (
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="aspect-video bg-slate-900">
                      {/* {React.createElement(ReactPlayer as any, {
                        url: selectedLesson.videoUrl,
                        controls: true,
                        width: "100%",
                        height: "100%",
                        playing: false,
                      })} */}
                      <video src={selectedLesson.videoUrl} controls className="w-full h-full object-cover" />
                        {/* controls={true}
                        width="100%"
                        height="100%"
                        playing={false} */}
                      
                    </div>
                  </div>
                )}

                {/* Lesson Content */}
                {selectedLesson.content && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Lesson Content
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {selectedLesson.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Assignments */}
                {lessonAssignments.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="font-bold text-lg text-blue-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Assignments
                    </h3>
                    <div className="space-y-3">
                      {lessonAssignments.map((assignment) => (
                        <Link
                          key={assignment._id}
                          href={`/courses/${params.id}/assignments/${assignment._id}`}
                          className="block p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-grow">
                              <h4 className="font-semibold text-blue-900 group-hover:text-blue-700 mb-1">
                                {assignment.title}
                              </h4>
                              {assignment.dueDate && (
                                <div className="flex items-center text-sm text-blue-700">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quizzes */}
                {lessonQuizzes.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="font-bold text-lg text-purple-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Quizzes
                    </h3>
                    <div className="space-y-3">
                      {lessonQuizzes.map((quiz) => (
                        <Link
                          key={quiz._id}
                          href={`/courses/${params.id}/quiz/${quiz._id}`}
                          className="block p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-grow">
                              <h4 className="font-semibold text-purple-900 group-hover:text-purple-700 mb-1">
                                {quiz.title}
                              </h4>
                              <p className="text-sm text-purple-700">
                                {quiz.questions?.length || 0} {quiz.questions?.length === 1 ? 'question' : 'questions'}
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complete Button */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  {selectedLesson.isCompleted ? (
                    <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-700 font-semibold">Lesson Completed</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleComplete(selectedLesson.lessonId)}
                      className="w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}

