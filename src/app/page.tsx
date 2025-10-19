import { Suspense } from "react";
import { HomeClient } from "@/components/HomeClient";
import { ServerBiasSummary } from "@/components/ServerBiasSummary";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Main Content - 3 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Prediction (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <HomeClient />
          </div>

          {/* Right Column - Bias Summary Panel (1 column) */}
          <div className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
              }
            >
              <ServerBiasSummary />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
