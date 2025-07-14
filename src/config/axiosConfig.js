import axios from "axios";
import { config } from "./url.config";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
    baseURL: `${config.apiBaseUrl}`,
    timeout: 10000,
    withCredentials: true, // Bật nếu backend yêu cầu cookie/credentials
});

let isRefreshing = false;
let refreshSubscribers = [];

const processQueue = (error, token = null) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

const onTokenRefreshed = (newToken) => {
    localStorage.setItem("token", newToken);
};

axiosInstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    if (!isRefreshing) {
                        isRefreshing = true;
                        try {
                            const response = await axiosInstance.post("/users/refresh-token", { refreshToken });
                            const newToken = response.data.accessToken;
                            onTokenRefreshed(newToken);
                            processQueue(null, newToken);
                        } catch (refreshError) {
                            localStorage.removeItem("token");
                            localStorage.removeItem("refreshToken");
                            processQueue(refreshError, null);
                            window.location.href = "/login";
                            return Promise.reject(refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    }

                    return new Promise((resolve, reject) => {
                        refreshSubscribers.push((token) => {
                            if (token) {
                                config.headers.Authorization = `Bearer ${token}`;
                                resolve(config);
                            } else {
                                reject(new Error("Token refresh failed"));
                            }
                        });
                    });
                } else {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                localStorage.removeItem("token");
                console.error("Token không hợp lệ:", error);
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        } else if (error.response && error.response.status === 403) {
            window.location.href = "/forbidden";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;