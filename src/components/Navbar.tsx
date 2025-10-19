import Link from "next/link";
import { Telescope } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Telescope className="h-6 w-6 text-slate-900 dark:text-slate-50" />
            <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Bias Vision
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
