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
    <nav className="border-b px-8 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold">
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
                  <button className="px-4 py-2 hover:underline">Admin</button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <button className="px-4 py-2 hover:underline">Dashboard</button>
                </Link>
              )}
              <span>{user?.username}</span>
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

