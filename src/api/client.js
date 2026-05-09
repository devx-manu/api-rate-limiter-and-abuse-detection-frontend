import axios from "axios";

const api = axios.create({
  baseURL: "https://api-rate-limiter-and-abuse-detection.onrender.com",
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
