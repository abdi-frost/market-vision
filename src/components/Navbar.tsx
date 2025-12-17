import Link from "next/link";
import { Telescope } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <Telescope className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900 dark:text-slate-50" />
            <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
              Bias Vision
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
