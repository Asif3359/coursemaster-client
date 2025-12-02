"use client";

import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { coursesApi } from "@/lib/api/courses";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [tags, setTags] = useState("");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "">("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    }

    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoryDropdownOpen]);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const response = await coursesApi.getCourses({
          page,
          limit: 9,
          search: search || undefined,
          category: category || undefined,
          tags: tags || undefined,
          sort: sort || undefined,
        });
        if (response.data) {
          setCourses(response.data.items || []);
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.pages || 1);
          } else {
            // Fallback if pagination is top-level
            setTotalPages((response as any).pagination?.pages || 1);
          }
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [page, search, category, tags, sort]);

  // Load categories (for filter chips) once
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await coursesApi.getCourses({
          page: 1,
          limit: 100,
        });
        const items = response.data?.items || [];
        const categories = Array.from(
          new Set(
            items
              .map((c: any) => c.category)
              .filter((c: any) => typeof c === "string" && c.trim().length > 0)
          )
        ) as string[];
        setAllCategories(categories);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 min-h-[80vh]">
        <h1 className="text-3xl font-bold mb-4">Available Courses</h1>

        {/* Filters & Search - Compact */}
        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search courses..."
                  className="w-full border border-slate-300 bg-white pl-9 pr-3 py-2 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Category with dropdown */}
            <div ref={categoryDropdownRef} className="w-full md:w-48">
              <div className="relative">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setPage(1);
                    setCategory(e.target.value);
                  }}
                  onFocus={() => setCategoryDropdownOpen(true)}
                  placeholder="Category"
                  className="w-full border border-slate-300 bg-white px-3 py-2 pr-8 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen((open) => !open)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                  aria-label="Toggle category dropdown"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown with chips */}
                {categoryDropdownOpen && allCategories.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl p-3">
                    <div className="flex flex-wrap gap-2">
                      {(showAllCategories
                        ? allCategories
                        : allCategories.slice(0, 20)
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setPage(1);
                            setCategory(cat);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                            category === cat
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                      {allCategories.length > 20 && !showAllCategories && (
                        <button
                          type="button"
                          onClick={() => setShowAllCategories(true)}
                          className="px-2 py-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-800 underline"
                        >
                          +{allCategories.length - 20} more
                        </button>
                      )}
                      {allCategories.length > 20 && showAllCategories && (
                        <button
                          type="button"
                          onClick={() => setShowAllCategories(false)}
                          className="px-2 py-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-800 underline"
                        >
                          Show less
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="w-full md:w-40">
              <input
                type="text"
                value={tags}
                onChange={(e) => {
                  setPage(1);
                  setTags(e.target.value);
                }}
                placeholder="Tags"
                className="w-full border border-slate-300 bg-white px-3 py-2 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Sort */}
            <div className="w-full md:w-40">
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value as any);
                }}
                className="w-full border border-slate-300 bg-white px-3 py-2 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-600">
            No courses found. Try adjusting your filters.
          </p>
        ) : (
          <div className="min-h-[50vh]">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="group border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                >
                  {/* Course Image/Icon Header */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="relative z-10 text-white text-6xl font-bold opacity-20 group-hover:opacity-30 transition-opacity">
                      {course.title?.split(" ")[0] || "C"}
                    </div>
                    {course.category && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold rounded-full shadow-sm">
                          {course.category}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 z-10">
                      <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                        <span className="text-2xl font-bold text-indigo-700">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h2 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Tags */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {course.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200"
                            >
                              {tag}
                            </span>
                          ))}
                          {course.tags.length > 3 && (
                            <span className="px-2.5 py-1 text-slate-500 text-xs font-medium">
                              +{course.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/courses/${course._id}`}
                      className="mt-auto inline-flex items-center justify-center px-5 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md group-hover:shadow-indigo-200"
                    >
                      View Course Details
                      <svg
                        className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`px-3 py-1 rounded border text-sm ${
            page <= 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-slate-900 border-slate-300 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className={`px-3 py-1 rounded border text-sm ${
            page >= totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-slate-900 border-slate-300 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
