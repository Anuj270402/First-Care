import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Profile from '@/pages/Profile';
import Orders from '@/pages/Orders';
import OrderDetails from '@/pages/OrderDetails';
import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen min-w-full max-w-full bg-background">
          <Navbar />
          <main className="w-full mx-auto px-4 lg:px-24 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;