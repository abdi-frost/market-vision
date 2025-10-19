import { Github, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Developed by</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              Megab
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://abdifrost.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              aria-label="Visit website"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">abdifrost.vercel.app</span>
            </a>
            <a
              href="https://github.com/abdifrost"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              aria-label="Visit GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">abdifrost</span>
            </a>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Market Vision. For educational purposes
            only.
          </p>
        </div>
      </div>
    </footer>
  );
}
