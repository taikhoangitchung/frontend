import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Lỗi:", error);
        return Promise.reject(error);
    }
);

export default instance;
