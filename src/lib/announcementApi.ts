import { ANNOUNCEMENT_API_URL } from "./config";
import axios from "axios";
import Cookies from "js-cookie";

export const announcementApi = axios.create({
  baseURL: ANNOUNCEMENT_API_URL,
});

announcementApi.interceptors.request.use(
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

export const getAnnouncements = async (className?: string) => {
  try {
    const response = await announcementApi.get("/announcement", {
      params: { className },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return [];
  }
};
