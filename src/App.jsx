import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AppProviders } from './app/providers';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import './index.scss';

const HomePage = lazy(() => import('./features/home/HomePage.jsx'));
const LoginPage = lazy(() => import('./features/auth/LoginPage.jsx'));
const Page404 = lazy(() => import('./features/misc/Page404.jsx'));

export default function App() {
  return (
    <div className="col-12 App">
      <AppProviders>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/">
                <Route index element={<HomePage />} />
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

