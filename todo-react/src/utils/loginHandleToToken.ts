import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";

const BASE_URL = "http://localhost:3005";

export const useTokenReset = () => {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        (error.response.status === 401 || error.response.status === 403) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const res = await axios.post(`${BASE_URL}/api/auth/refreshToken`, {
            refreshToken,
          });
          console.log(res.data);
          const newToken = res.data.accessToken;

          setToken(newToken);
          localStorage.setItem("token", newToken);

          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          console.error("Token refresh failed:", err);
          navigate("/");
        }
      } else if (error.response.status === 403) {
        navigate("/");
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};
