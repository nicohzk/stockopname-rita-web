import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./components/layout/main-layout";
import DashboardPage from "./pages/dashboard/dashboard-page";
import MasterPage from "./pages/master/master-page";
import StockOpnamePage from "./pages/stock-opname/stock-opname-page";
import SessionPage from "./pages/stock-opname/session-page";
import CoorPage from "./pages/stock-opname/coor-page";
import { ToastProvider } from "./components/ui/toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/master" element={<MasterPage />} />
          <Route path="/stock-opname" element={<StockOpnamePage />} />
          <Route
            path="/stock-opname/sesi/:sessionId"
            element={<SessionPage />}
          />
          <Route
            path="/stock-opname/sesi/:sessionId/coordinator/:coorId"
            element={<CoorPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
