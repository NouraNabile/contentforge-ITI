// src/api/client.js

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ أضف هذا: REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cf_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// RESPONSE interceptor (الكود الموجود لديك)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || error.message || "Something went wrong";
    const reason = data?.reason;
    const upgradeUrl = data?.upgradeUrl;

    if (status === 401) {
      localStorage.removeItem("cf_token");
      localStorage.removeItem("cf_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      const currentPath = window.location.pathname;

      if (reason === "trial_expired") {
        if (currentPath !== "/trial-expired") {
          window.location.href = "/trial-expired";
        }
      } else if (reason === "feature_locked") {
        if (currentPath !== "/payment") {
          alert(message);
          window.location.href = upgradeUrl || "/payment";
        }
      } else {
        if (currentPath !== "/trial-expired") {
          window.location.href = "/trial-expired";
        }
      }
    }

    if (status === 429) {
      console.warn("Rate limited — slow down requests");
    }

    return Promise.reject({ status, message });
  },
);

export default api;