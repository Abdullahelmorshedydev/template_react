import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy } from "react";
import { AppProviders } from "./app/providers";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "./index.scss";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Page404 = lazy(() => import("./pages/Page404"));

export default function App() {
  return (
    <div className="col-12 App">
      <AppProviders>
        <BrowserRouter>
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
        </BrowserRouter>
      </AppProviders>
    </div>
  );
}
