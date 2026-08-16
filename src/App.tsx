import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import MainLayout from "./components/layout/main-layout"
import DashboardPage from "./pages/dashboard/dashboard-page"
import MasterPage from "./pages/master/master-page"
import ReportsPage from "./pages/reports/reports-page"
import StockOpnamePage from "./pages/stock-opname/stock-opname-page"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/master" element={<MasterPage />} />
          <Route path="/stock-opname" element={<StockOpnamePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App