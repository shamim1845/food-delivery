import axios from "axios";
import { getToken } from "./auth";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;
if (!SERVER_URL) {
  throw new Error("EXPO_PUBLIC_SERVER_URL is not defined");
}

const API_URL = `${SERVER_URL}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
