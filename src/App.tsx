import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Cookies from "js-cookie";
import { clearMemberAuth, decodeJWT, isMemberUser } from "./lib/api";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import SessionDetail from "./pages/SessionDetail";

import "./App.css";

const MemberProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = Cookies.get("token");
  const decoded = token ? decodeJWT(token) : null;

  if (!token || !isMemberUser(decoded)) {
    if (token) {
      clearMemberAuth();
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard"
              element={
                <MemberProtectedRoute>
                  <Dashboard />
                </MemberProtectedRoute>
              }
            />
            <Route
              path="/session/:id"
              element={
                <MemberProtectedRoute>
                  <SessionDetail />
                </MemberProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;