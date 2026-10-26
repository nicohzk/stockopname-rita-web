import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./components/layout/main-layout";
import StockOpnamePage from "./pages/stock-opname/stock-opname-page";
import SessionPage from "./pages/stock-opname/session-page";
import CoorPage from "./pages/stock-opname/coor-page";
import ProductPage from "./pages/stock-opname/product-page";
import { ToastProvider } from "./components/ui/toast";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  return (
    <ToastProvider>
      <TooltipProvider>
      <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/stock-opname" replace />} />
          <Route path="/stock-opname" element={<StockOpnamePage />} />
          <Route
            path="/stock-opname/sesi/:sessionId"
            element={<SessionPage />}
          />
          <Route
            path="/stock-opname/sesi/:sessionId/produk"
            element={<ProductPage />}
          />
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
