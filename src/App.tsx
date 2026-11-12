import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import ErrorBoundary from "./components/error-boundary";
import MainLayout from "./components/layout/main-layout";
import ScrollToTop from "./components/layout/scroll-to-top";
import { LoadingSpinner } from "./components/ui/loading";
import { ToastProvider } from "./components/ui/toast-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./lib/auth-context";
import { AuthProvider } from "./lib/auth-provider";

// Each page is its own chunk: the first load only pays for the shell and the
// page being opened.
const StockOpnamePage = lazy(() => import("./pages/stock-opname/stock-opname-page"));
const SessionPage = lazy(() => import("./pages/stock-opname/session-page"));
const CoorPage = lazy(() => import("./pages/stock-opname/coor-page"));
const ProductPage = lazy(() => import("./pages/stock-opname/product-page"));
const CoordinatorQRPrintPage = lazy(() => import("./pages/stock-opname/coordinator-qr-print-page"));
const LoginPage = lazy(() => import("./pages/login-page"));
const OperatorPage = lazy(() => import("./pages/operator-page"));

function ScreenLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <LoadingSpinner message={message} />
    </div>
  );
}

/**
 * Pintu masuk aplikasi. Sesi belum dimuat → tunggu; belum login → halaman
 * login; sudah login tanpa nama → layar operator, dan layar itu tidak bisa
 * dilewati karena setiap route aplikasi memakai gate yang sama.
 */
function SessionGate({
  children,
  requireOperator = true,
}: {
  children: ReactNode;
  requireOperator?: boolean;
}) {
  const { state, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <ScreenLoading message="Memeriksa sesi..." />;
  }

  if (!state.authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireOperator && state.operator === "") {
    return <Navigate to="/operator" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ToastProvider>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <ErrorBoundary>
              <Suspense fallback={<ScreenLoading message="Memuat halaman..." />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  {/* Layar operator tetap bisa dibuka setelah nama terisi, untuk
                      mengganti siapa yang bertugas. */}
                  <Route
                    path="/operator"
                    element={
                      <SessionGate requireOperator={false}>
                        <OperatorPage />
                      </SessionGate>
                    }
                  />

                  {/* Outside the main layout: opened in its own tab for printing. */}
                  <Route
                    path="/stock-opname/sesi/:sessionId/print-qr"
                    element={
                      <SessionGate>
                        <CoordinatorQRPrintPage />
                      </SessionGate>
                    }
                  />

                  <Route
                    element={
                      <SessionGate>
                        <MainLayout />
                      </SessionGate>
                    }
                  >
                    <Route path="/" element={<Navigate to="/stock-opname" replace />} />
                    <Route path="/stock-opname" element={<StockOpnamePage />} />
                    <Route path="/stock-opname/sesi/:sessionId" element={<SessionPage />} />
                    <Route path="/stock-opname/sesi/:sessionId/produk" element={<ProductPage />} />
                    <Route
                      path="/stock-opname/sesi/:sessionId/coordinator/:coorId"
                      element={<CoorPage />}
                    />
                    <Route path="*" element={<Navigate to="/stock-opname" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ToastProvider>
  );
}

export default App;
