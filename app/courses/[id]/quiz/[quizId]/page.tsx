"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { quizzesApi } from "@/lib/api/quizzes";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push("/login");
      return;
    }

    loadQuiz();
  }, [mounted, token, router, params.quizId]);

  async function loadQuiz() {
    try {
      // First check if quiz is already submitted
      try {
        const submissionRes = await quizzesApi.getQuizSubmission(params.quizId as string);
        if (submissionRes.data) {
          // Quiz already submitted, show results
          setSubmitted(true);
          setSubmissionResult(submissionRes.data.submission);
          
          // Load quiz data to show questions with answers
          const quizResponse = await quizzesApi.getQuiz(params.quizId as string);
          if (quizResponse.data) {
            // Use the submission data which includes questions with correct answers
            setQuiz({
              ...quizResponse.data,
              questions: submissionRes.data.questions, // Use questions from submission (includes correct answers)
            });
            // Set selected options from submission
            setSelectedOptions(submissionRes.data.submission.selectedOptions);
          }
          setLoading(false);
          return;
        }
      } catch (submissionErr: any) {
        // 404 means quiz not submitted yet, which is fine - continue to load quiz
        if (!submissionErr.message || !submissionErr.message.includes("404")) {
          console.error("Error checking submission:", submissionErr);
        }
      }

      // Quiz not submitted, load quiz normally
      const response = await quizzesApi.getQuiz(params.quizId as string);
      if (response.data) {
        const quizData = response.data;
        setQuiz(quizData);
        // Initialize selectedOptions array with -1 for each question
        setSelectedOptions(new Array(quizData.questions.length).fill(-1));
      }
    } catch (err) {
      console.error("Failed to load quiz:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    const newSelected = [...selectedOptions];
    newSelected[questionIndex] = optionIndex;
    setSelectedOptions(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all questions are answered
    if (selectedOptions.some((opt) => opt === -1)) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setSubmitting(true);
    try {
      const response = await quizzesApi.submitQuiz(params.quizId as string, {
        selectedOptions,
      });

      if (response.data) {
        setSubmitted(true);
        setSubmissionResult(response.data);
      } else {
        toast.error(response.message || "Failed to submit quiz");
      }
    } catch (err: any) {
      if (err.message && err.message.includes("already submitted")) {
        toast.error("You have already submitted this quiz. Cannot submit twice.");
      } else {
        toast.error(err.message || "Failed to submit quiz");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-600 text-lg">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6 text-6xl">📋</div>
            <h1 className="text-3xl font-bold mb-3 text-slate-900">Quiz not found</h1>
            <p className="text-slate-600 mb-6 text-lg">
              The quiz you're looking for doesn't exist.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
            {quiz.title}
          </h1>
          {!submitted && (
            <p className="text-white/90 text-lg">
              {quiz.questions?.length || 0} {quiz.questions?.length === 1 ? 'question' : 'questions'}
            </p>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {submitted && submissionResult ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="text-center pb-6 border-b border-slate-200">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Quiz Results</h2>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4 shadow-lg">
                <span className="text-5xl font-bold text-white">{submissionResult.score}%</span>
              </div>
              <p className="text-xl text-slate-700 font-semibold">
                {submissionResult.correctAnswers} out of {submissionResult.totalQuestions} questions correct
              </p>
              <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Quiz Completed
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Question Review
              </h3>
              {quiz.questions.map((question: any, qIndex: number) => {
                const selectedIndex = selectedOptions[qIndex];
                const isCorrect = selectedIndex === question.correctOptionIndex;
                return (
                  <div key={qIndex} className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-bold text-lg text-slate-900 flex-1">
                        Question {qIndex + 1}: {question.questionText}
                      </h4>
                      {isCorrect ? (
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Correct
                        </span>
                      ) : (
                        <span className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Incorrect
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {question.options.map(
                        (option: string, optIndex: number) => {
                          const isSelected = selectedIndex === optIndex;
                          const isCorrectAnswer = optIndex === question.correctOptionIndex;
                          return (
                            <div
                              key={optIndex}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                isCorrectAnswer
                                  ? "bg-green-50 border-green-500"
                                  : isSelected
                                  ? "bg-red-50 border-red-500"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-slate-900">{option}</span>
                                {isCorrectAnswer && (
                                  <span className="ml-2 font-semibold text-green-700 flex items-center">
                                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Correct Answer
                                  </span>
                                )}
                                {isSelected && !isCorrectAnswer && (
                                  <span className="ml-2 font-semibold text-red-700 flex items-center">
                                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Your Answer
                                  </span>
                                )}
                                {isSelected && isCorrectAnswer && (
                                  <span className="ml-2 font-semibold text-green-700 flex items-center">
                                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Your Answer (Correct)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-200">
              <Link
                href={`/courses/${params.id}/learn`}
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Course
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {quiz.questions.map((question: any, qIndex: number) => (
              <div key={qIndex} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mr-3">
                    {qIndex + 1}
                  </span>
                  {question.questionText}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option: string, optIndex: number) => (
                    <label
                      key={optIndex}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOptions[qIndex] === optIndex
                          ? "bg-indigo-50 border-indigo-500 shadow-md"
                          : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={optIndex}
                        checked={selectedOptions[qIndex] === optIndex}
                        onChange={() => handleOptionSelect(qIndex, optIndex)}
                        className="mr-4 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-900 flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center text-slate-600">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium">
                    {selectedOptions.filter((opt) => opt !== -1).length} of {quiz.questions.length} questions answered
                  </span>
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
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
                      Submit Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
