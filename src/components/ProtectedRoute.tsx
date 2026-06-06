import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "@tanstack/react-router";

export function ProtectedRoute() {
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      window.location.href = `/login?to=${encodeURIComponent(window.location.href)}`;
    }
  }, [isAuthenticated, isReady]);

  if (!isAuthenticated) {
    if (isReady) {
      return null;
    }
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return <Outlet />;
}
