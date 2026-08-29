import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import MainLayout from "./components/layout/main-layout"
import DashboardPage from "./pages/dashboard/dashboard-page"
import MasterPage from "./pages/master/master-page"
import StockOpnamePage from "./pages/stock-opname/stock-opname-page"
import SessionPage from "./pages/stock-opname/session-page"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/master" element={<MasterPage />} />
          <Route path="/stock-opname" element={<StockOpnamePage />} />
          <Route path="/stock-opname/:sessionId" element={<SessionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App