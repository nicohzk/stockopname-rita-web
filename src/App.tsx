import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ErrorBoundary from "./components/error-boundary";
import MainLayout from "./components/layout/main-layout";
import ScrollToTop from "./components/layout/scroll-to-top";
import { LoadingSpinner } from "./components/ui/loading";
import { ToastProvider } from "./components/ui/toast-provider";
import { TooltipProvider } from "./components/ui/tooltip";

// Each page is its own chunk: the first load only pays for the shell and the
// page being opened.
const StockOpnamePage = lazy(() => import("./pages/stock-opname/stock-opname-page"));
const SessionPage = lazy(() => import("./pages/stock-opname/session-page"));
const CoorPage = lazy(() => import("./pages/stock-opname/coor-page"));
const ProductPage = lazy(() => import("./pages/stock-opname/product-page"));
const CoordinatorQRPrintPage = lazy(() => import("./pages/stock-opname/coordinator-qr-print-page"));

function App() {
  return (
    <ToastProvider>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Outside the main layout: opened in its own tab for printing. */}
            <Route
              path="/stock-opname/sesi/:sessionId/print-qr"
              element={
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSpinner message="Memuat halaman cetak..." />}>
                    <CoordinatorQRPrintPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route element={<MainLayout />}>
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
        </BrowserRouter>
      </TooltipProvider>
    </ToastProvider>
  );
}

export default App;
