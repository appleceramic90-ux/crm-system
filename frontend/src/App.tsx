import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";

/**
 * Configure TanStack Query client with optimized defaults
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            {/* 公开路由 */}
            <Route
              path="/login"
              element={
                <PageTransition transition="fade">
                  <Login />
                </PageTransition>
              }
            />

            {/* 受保护的应用路由 */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnimatedRoutes>
                      <Routes>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route
                          path="dashboard"
                          element={
                            <PageTransition transition="slide-fade">
                              <Dashboard />
                            </PageTransition>
                          }
                        />
                        <Route
                          path="customers"
                          element={
                            <PageTransition transition="slide-fade">
                              <Customers />
                            </PageTransition>
                          }
                        />
                        <Route
                          path="customers/new"
                          element={
                            <PageTransition transition="fade">
                              <CustomerForm />
                            </PageTransition>
                          }
                        />
                        <Route
                          path="customers/:id/edit"
                          element={
                            <PageTransition transition="fade">
                              <CustomerForm />
                            </PageTransition>
                          }
                        />
                      </Routes>
                    </AnimatedRoutes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 页面 */}
            <Route
              path="*"
              element={
                <PageTransition transition="fade">
                  <NotFound />
                </PageTransition>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App
