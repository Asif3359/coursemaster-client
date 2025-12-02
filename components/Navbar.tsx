"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { clearAuth } from "@/lib/store";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.push("/login");
  };

  return (
    <nav className="border-b border-indigo-100 bg-white/80 backdrop-blur px-4 md:px-8 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold text-indigo-700">
          CourseMaster
        </Link>
        <div className="flex gap-4 items-center">
          {!mounted ? (
            // Show default state during SSR to prevent hydration mismatch
            <>
              <Link href="/login">
                <button className="px-4 py-2 hover:underline">Login</button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          ) : token ? (
            <>
              {user?.role === "admin" ? (
                <Link href="/admin/dashboard">
                  <button className="px-4 py-2 text-sm text-indigo-700 hover:text-indigo-900">
                    Admin
                  </button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <button className="px-4 py-2 text-sm text-indigo-700 hover:text-indigo-900">
                    Dashboard
                  </button>
                </Link>
              )}
              <span className="text-sm text-slate-700">{user?.username}</span>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="px-4 py-2 hover:underline">Login</button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

