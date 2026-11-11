import { Suspense } from "react"
import { Outlet, useLocation } from "react-router-dom"
import AppSidebar from "./app-sidebar"
import ErrorBoundary from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function MainLayout() {
  const location = useLocation()

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />

      <main className="min-w-0 flex-1 p-3 sm:p-4">
        <SidebarTrigger />
        {/* Boundary di luar Suspense: kegagalan memuat chunk halaman juga
            tertangkap, bukan hanya error saat render. */}
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<LoadingSpinner message="Memuat halaman..." />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </SidebarProvider>
  )
}
