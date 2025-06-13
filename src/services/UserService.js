import axiosInstance from "./config";

class UserService {
    static async isAdmin(userId) {
        try {
            return await axiosInstance.get(`/users/is-admin/${userId}`);
        } catch (error) {
            console.error("Lỗi khi tạo câu hỏi", error)
            throw error
        }
    }

    static async getAllExceptAdmin() {
        try {
            return await axiosInstance.get("/users");
        } catch (error) {
            console.error("Lỗi khi tạo câu hỏi", error)
            throw error
        }
    }

    static async login(email, password) {
        try {
            return await axiosInstance.post('/users/login', { email, password });
        } catch (error) {
            console.error("Lỗi khi đăng nhập", error);
            throw error;
        }
    }

    static async register(username, email, password) {
        try {
            return await axiosInstance.post('/users/register', { username, email, password });
        } catch (error) {
            console.error("Lỗi khi đăng ký", error);
            throw error;
        }
    }

    static async changePassword(email, oldPassword, newPassword) {
        try {
            return await axiosInstance.post('/users/change-password', { email, oldPassword, newPassword });
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu", error);
            throw error;
        }
    }
}

export default UserService
