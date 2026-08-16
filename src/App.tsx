import { BrowserRouter, Routes, Route } from "react-router-dom"

import MainLayout from "./components/layout/main-layout"
import DashboardPage from "./pages/dashboard/dashboard-page"
import ProductsPage from "./pages/products/products-page"
import StockOpnamePage from "./pages/stock-opname/stock-opname-page"
import ReportsPage from "./pages/reports/reports-page"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/stock-opname" element={<StockOpnamePage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App