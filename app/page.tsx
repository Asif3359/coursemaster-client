"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { coursesApi } from "@/lib/api/courses";

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await coursesApi.getCourses({ limit: 10 });
        if (response.data) {
          setCourses(response.data.items || []);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="border p-4 rounded-lg">
                <h2 className="font-bold text-lg">{course.title}</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {course.description}
                </p>
                <p className="mt-4 font-semibold">${course.price}</p>
                <a
                  href={`/courses/${course._id}`}
                  className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
