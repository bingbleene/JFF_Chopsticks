import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from "./pages/HomePage";
import ImportPage from "./pages/ImportPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import InvoicePage from "./pages/InvoicePage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/products"
            element={<ProductManagementPage />}
          />

          <Route
            path="/import"
            element={<ImportPage />}
          />

          <Route
            path="/invoices"
            element={<InvoicePage />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
