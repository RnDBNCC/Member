import { API_URL } from "./config";
import axios from "axios";
import Cookies from "js-cookie";

export const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  async login(identifier: string, password: string, appCode: string = 'brac') {
    return API.post('/login', { identifier, password, appCode });
  }
};

export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT', error);
    return null;
  }
};

export const extractRoleNames = (payload: any): string[] => {
  if (!payload) return [];
  const extracted: string[] = [];

  if (Array.isArray(payload.roles)) {
    for (const item of payload.roles) {
      if (typeof item === "string") {
        extracted.push(item.toLowerCase());
      } else if (
        item &&
        typeof item === "object" &&
        typeof item.role === "string"
      ) {
        extracted.push(item.role.toLowerCase());
      }
    }
  }

  if (Array.isArray(payload.globalRoles)) {
    for (const item of payload.globalRoles) {
      if (typeof item === "string") {
        extracted.push(item.toLowerCase());
      }
    }
  }

  return Array.from(new Set(extracted));
};

export const isMemberUser = (decoded: any): boolean => {
  if (!decoded) return false;
  const roles = extractRoleNames(decoded);
  if (roles.includes("superadmin")) return true;
  return roles.includes("member") || roles.includes("praetorian");
};

export const clearMemberAuth = () => {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  localStorage.removeItem("user");
};
