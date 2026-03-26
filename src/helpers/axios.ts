import axios from "axios";

const axiosInstance = (token?: string) => {
  const instance = axios.create({
    baseURL: "http://localhost:5000",
    timeout: 30 * 60 * 1000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return instance;
};

export default axiosInstance;