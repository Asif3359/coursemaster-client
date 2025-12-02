"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { clearAuth } from "@/lib/store";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.push("/login");
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const NavLink = ({
    href,
    children,
    className = "",
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
          active
            ? "text-indigo-700 bg-indigo-50 font-semibold"
            : "text-slate-700 hover:text-indigo-700 hover:bg-slate-50"
        } ${className}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="border-b border-indigo-100 bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CourseMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {!mounted ? (
              // Show default state during SSR to prevent hydration mismatch
              <>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/login">Login</NavLink>
                <Link href="/register">
                  <Button className="ml-2">Sign Up</Button>
                </Link>
              </>
            ) : token ? (
              <>
                <NavLink href="/">Home</NavLink>
                {user?.role === "admin" ? (
                  <NavLink href="/admin/dashboard">Admin Dashboard</NavLink>
                ) : (
                  <NavLink href="/dashboard">Dashboard</NavLink>
                )}
                <div className="ml-4 flex items-center gap-4 border-l border-slate-200 pl-4">
                  <span className="text-sm font-medium text-slate-700">
                    {user?.username}
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <NavLink href="/">Home</NavLink>
                <NavLink href="/login">Login</NavLink>
                <Link href="/register">
                  <Button className="ml-2">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className={`h-6 w-6 transition-opacity ${isMenuOpen ? "hidden" : "block"}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              className={`h-6 w-6 transition-opacity ${isMenuOpen ? "block" : "hidden"}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`md:hidden border-t border-slate-200 py-4 space-y-1 transition-all duration-200 ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          {!mounted ? (
            <>
              <NavLink
                href="/"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                href="/login"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </NavLink>
              <div className="pt-2">
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </>
          ) : token ? (
            <>
              <NavLink
                href="/"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              {user?.role === "admin" ? (
                <NavLink
                  href="/admin/dashboard"
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </NavLink>
              ) : (
                <NavLink
                  href="/dashboard"
                  className="block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
              )}
              <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {user?.username}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-slate-300"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                href="/"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                href="/login"
                className="block"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </NavLink>
              <div className="pt-2">
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

