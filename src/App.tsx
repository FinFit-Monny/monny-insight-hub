import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionBoundary } from "@/components/session-boundary";
import { SessionQueries } from "@/providers/SessionQueries";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@/providers/ClerkProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VoucherWhitelist from "./pages/VoucherWhitelist";
import VoucherCode from "./pages/VoucherCode";
import { useTranslation } from "react-i18next";


const App = () => {
  const { t } = useTranslation();
  return (
    <ClerkProvider>
      <SessionBoundary><SessionQueries>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/protected" element={
                <ProtectedRoute>
                  <div className="p-8">{t("header.protected")}</div>
                </ProtectedRoute>
              } />
              <Route path="/voucher-whitelist" element={
                <ProtectedRoute>
                  <VoucherWhitelist />
                </ProtectedRoute>
              } />
              <Route path="/voucher-whitelist/code" element={
                <ProtectedRoute>
                  <VoucherCode />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SessionQueries></SessionBoundary>
    </ClerkProvider>
  );
};

export default App;
