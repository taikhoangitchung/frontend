import axios from "axios";
import { config } from "./url.config";
import { jwtDecode } from "jwt-decode"

const axiosInstance = axios.create({
    baseURL: `${config.apiBaseUrl}`,
    timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây
            if (decodedToken.exp < currentTime) {
                // Token đã hết hạn
                localStorage.removeItem("token");
                // Không thêm tiêu đề Authorization
            } else {
                // Token còn hợp lệ, thêm vào yêu cầu
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            // Token không hợp lệ, xóa khỏi localStorage
            localStorage.removeItem("token");
            console.error("Token không hợp lệ:", error);
        }
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;