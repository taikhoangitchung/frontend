import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return {
            email: decoded.sub,
            id: decoded.id,
            role: decoded.role,
            username: decoded.username,
        };
    } catch {
        return null;
    }
};