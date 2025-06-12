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
}

export default UserService
