function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-900 text-slate-100 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 grid gap-8 md:grid-cols-3">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold tracking-tight">CourseMaster</h2>
          <p className="mt-2 text-sm text-slate-300">
            Learn modern skills from curated courses and track your progress as
            you grow.
          </p>
        </div>

        {/* Links */}
        <div className="text-sm">
          <h3 className="font-semibold mb-2 text-slate-100">Navigation</h3>
          <ul className="space-y-1 text-slate-300">
            <li>
              <a href="/" className="hover:text-white transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/courses/1" className="hover:text-white transition-colors">
                Sample Course
              </a>
            </li>
          </ul>
        </div>

        {/* Contact / Meta */}
        <div className="text-sm">
          <h3 className="font-semibold mb-2 text-slate-100">Stay Connected</h3>
          <p className="text-slate-300 mb-2">
            Have feedback or questions? Reach out any time.
          </p>
          <p className="text-slate-300">
            Email: <span className="font-mono">support@coursemaster.com</span>
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>© {currentYear} CourseMaster. All rights reserved.</span>
          <span className="flex gap-4">
            <a href="#" className="hover:text-slate-200 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-200 transition-colors">
              Privacy
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer