import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
});

// ✅ DO NOT show alerts here
api.interceptors.response.use(
  res => res,
  err => {
    // just pass error silently
    return Promise.reject(err);
  }
);

export default api;