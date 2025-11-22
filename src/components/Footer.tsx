import { Github, Globe } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span>Developed by</span>
            <Link href="https://abdifrost.vercel.app" className="font-semibold text-slate-900 dark:text-slate-50">
              Megab
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="https://abdifrost.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              aria-label="Visit website"
            >
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">abdifrost.vercel.app</span>
            </Link>
            <Link
              href="https://github.com/abdifrost"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              aria-label="Visit GitHub"
            >
              <Github className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">abdifrost</span>
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              aria-label="Terms and Disclaimer"
            >
              <span className="underline">Terms</span>
            </Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
            © {new Date().getFullYear()} Market Vision. For educational purposes
            only.
          </p>
        </div>
      </div>
    </footer>
  );
}
