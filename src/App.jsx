import { BrowserRouter, Route, Routes } from "react-router-dom";
import Page404 from "./pages/Page404";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import './index.scss';

export default function App() {
  return (
    <div className="col-12 App">
      <BrowserRouter>
        <Routes>
          <Route path="/" >
            <Route index element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="*" element={<Page404 />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// #Essentials
// npm i -D react-router-dom@latest
// npm i sass
// npm i bootstrap@latest
// npm i axios

// #State Management
// npm install @reduxjs/toolkit react-redux
// npm i recoil

// #Fontawesome
// npm i --save @fortawesome/fontawesome-svg-core
// npm i --save @fortawesome/free-solid-svg-icons
// npm i --save @fortawesome/free-regular-svg-icons
// npm i --save @fortawesome/free-brands-svg-icons
// npm i --save @fortawesome/react-fontawesome@latest

// #Optional
// npm i sweetalert2
// npm i swiper
// npm i wowjs
// npm i animate.css --save
