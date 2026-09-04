import { Suspense } from "react";
import ActivateAccountContent from "./ActivateAccountContent";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <svg
        className="animate-spin"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94887B"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ActivateAccountContent />
    </Suspense>
  );
}
