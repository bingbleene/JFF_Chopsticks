import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from "./pages/HomePage";
import ImportPage from "./pages/ImportPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import InvoicePage from "./pages/InvoicePage";
import NotFound from "./pages/NotFound";
import SignInPage from './pages/SignInPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          // Public routes
          <Route
            path="/signin"
            element={<SignInPage />}
          />

          // Private routes
          <Route element={<ProtectedRoute />}>
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
        </Route>
        
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
