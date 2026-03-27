import axios from 'axios';
import Cookies from 'js-cookie';
import { LEARNING_API_URL } from './config';

const learningApi = axios.create({
  baseURL: LEARNING_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

learningApi.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMyClass = async () => {
  const response = await learningApi.get('/class/my-class');
  return response.data;
};

export const getMySessions = async () => {
  const response = await learningApi.get('/class-session/my-sessions');
  return response.data;
};

export const getSessionDetail = async (id: string) => {
  const response = await learningApi.get(`/class-session/detail/${id}`);
  return response.data;
};

export default learningApi;
