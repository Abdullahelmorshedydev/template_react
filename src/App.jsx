import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppProviders } from "./app/providers";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "./index.scss";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Page404 = lazy(() => import("./pages/Page404"));

function PageFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#0d0d0d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: "0.9rem",
      }}
    >
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <div className="col-12 App">
      <AppProviders>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/">
                <Route
                  index
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
              </Route>
              <Route path="*" element={<Page404 />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProviders>
    </div>
  );
}
