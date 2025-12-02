"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { adminQuizzesApi } from "@/lib/api/admin/quizzes";
import { coursesApi } from "@/lib/api/courses";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import Link from "next/link";

export default function AdminQuizzesPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    lessonId: "",
    title: "",
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
      },
    ],
  });
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

    loadData();
  }, [mounted, token, user, router, params.courseId]);

  async function loadData() {
    try {
      const [courseRes, quizzesRes] = await Promise.all([
        coursesApi.getCourseById(params.courseId as string),
        adminQuizzesApi
          .getQuizzesForCourse(params.courseId as string)
          .catch(() => ({ data: [] })),
      ]);

      if (courseRes.data) {
        setCourse(courseRes.data.course);
      }
      if (quizzesRes.data) {
        setQuizzes(quizzesRes.data);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.lessonId ||
      !formData.title ||
      formData.questions.length === 0
    ) {
      toast.error("Lesson ID, title, and at least one question are required");
      return;
    }

    // Validate questions
    for (const q of formData.questions) {
      if (!q.questionText.trim()) {
        toast.error("All questions must have text");
        return;
      }
      if (q.options.filter((opt) => opt.trim()).length < 2) {
        toast.error("Each question must have at least 2 options");
        return;
      }
      if (
        q.correctOptionIndex < 0 ||
        q.correctOptionIndex >= q.options.length
      ) {
        toast.error("Each question must have a valid correct option index");
        return;
      }
    }

    try {
      await adminQuizzesApi.createQuiz({
        courseId: params.courseId as string,
        lessonId: formData.lessonId,
        title: formData.title,
        questions: formData.questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.filter((opt) => opt.trim()),
          correctOptionIndex: q.correctOptionIndex,
        })),
      });

      setShowForm(false);
      setFormData({
        lessonId: "",
        title: "",
        questions: [
          {
            questionText: "",
            options: ["", "", "", ""],
            correctOptionIndex: 0,
          },
        ],
      });
      loadData();
      toast.success("Quiz created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to create quiz");
    }
  };

  const handleDelete = (quizId: string) => {
    setDeleteTarget(quizId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminQuizzesApi.deleteQuiz(deleteTarget);
      setDeleteTarget(null);
      loadData();
      toast.success("Quiz deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    (newQuestions[index] as any)[field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push("");
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    // Adjust correctOptionIndex if needed
    if (newQuestions[questionIndex].correctOptionIndex >= optionIndex) {
      newQuestions[questionIndex].correctOptionIndex = Math.max(
        0,
        newQuestions[questionIndex].correctOptionIndex - 1
      );
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  if (!mounted || !token || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  const syllabus = course?.syllabus || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Manage Quizzes</h1>
          </div>
          <p className="text-white/90 text-lg">{course?.title}</p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-600">
            Create quizzes for lessons in this course.
          </p>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Quiz
              </>
            )}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Create New Quiz</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Lesson ID <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.lessonId}
                  onChange={(e) =>
                    setFormData({ ...formData, lessonId: e.target.value })
                  }
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  required
                >
                  <option value="">-- Select a lesson --</option>
                  {syllabus.map((lesson: any) => (
                    <option key={lesson.lessonId} value={lesson.lessonId}>
                      {lesson.lessonId} - {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  required
                  placeholder="Quiz title"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Questions <span className="text-red-500">*</span>
                  </label>
                  <Button 
                    type="button" 
                    onClick={addQuestion}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Question
                  </Button>
                </div>

                {formData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border-2 border-slate-200 rounded-xl p-6 mb-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {qIndex + 1}
                        </div>
                        <h4 className="font-semibold text-slate-900">Question {qIndex + 1}</h4>
                      </div>
                      {formData.questions.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Question Text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) =>
                          updateQuestion(qIndex, "questionText", e.target.value)
                        }
                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none bg-white"
                        required
                        rows={3}
                        placeholder="Enter question text"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Options</label>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={`q${qIndex}-opt${optIndex}-${option}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-slate-200 hover:border-indigo-300 transition-colors">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctOptionIndex === optIndex}
                              onChange={() =>
                                updateQuestion(
                                  qIndex,
                                  "correctOptionIndex",
                                  optIndex
                                )
                              }
                              className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optIndex] = e.target.value;
                                updateQuestion(qIndex, "options", newOptions);
                              }}
                              className="flex-1 border-0 focus:ring-0 outline-none bg-transparent"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                onClick={() => removeOption(qIndex, optIndex)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="mt-3 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Option
                      </Button>
                    </div>

                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Select the radio button next to the correct answer
                    </p>
                  </div>
                ))}
              </div>

              <Button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                Create Quiz
              </Button>
            </form>
          </div>
        )}

        {/* Quizzes List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Existing Quizzes</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
              {quizzes.length}
            </span>
          </div>
          {quizzes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg font-medium">No quizzes created yet.</p>
              <p className="text-slate-500 mt-2">Create your first quiz to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz._id || `quiz-${index}`}
                  className="bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-slate-900 mb-2">{quiz.title}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span className="font-medium">Lesson:</span>
                              <span>{quiz.lessonId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Questions:</span>
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                                {quiz.questions?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete(quiz._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg ml-4"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete quiz?"
        description="This will remove the quiz and students will no longer be able to take it."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
