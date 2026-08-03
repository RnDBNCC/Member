import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter, Routes, Route } from "react-router";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import SessionDetail from "./pages/SessionDetail";

import "./App.css";

function App() {
  return (
    <ConfigProvider>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/session/:id" element={<SessionDetail />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;