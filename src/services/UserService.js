import axiosInstance from "./config";

class UserService {
    static async removeUser(userId) {
        try {
            return await axiosInstance.delete(`/users/${userId}`);
        } catch (error) {
            console.error(`Lỗi khi xóa user với id : ${userId}`);
            return error;
        }
    }

    static async searchFollowNameAndEmail(keyName, keyEmail) {
        try {
            const api = keyName.trim() === ""
                ? `/users/search?keyEmail=${keyEmail}`
                : (keyEmail.trim() === ""
                        ? `/users/search?keyName=${keyName}`
                        : `/users/search?keyName=${keyName}&keyEmail=${keyEmail}`
                );
            return await axiosInstance.get(api);
        } catch (error) {
            console.error(`Lỗi khi tìm kiếm người dùng với keyName = ${keyName}, keyEmail = ${keyEmail}`);
            throw error;
        }
    }

    static async getAllExceptAdmin() {
        try {
            return await axiosInstance.get("/users");
        } catch (error) {
            throw error;
        }
    }

    static async login(email, password) {
        try {
            return await axiosInstance.patch('/users/login', { email, password });
        } catch (error) {
            throw error;
        }
    }

    static async register(username, email, password) {
        try {
            return await axiosInstance.post('/users', { username, email, password }); // Thay /users/register thành /users
        } catch (error) {
            throw error;
        }
    }

    static async changePassword(userId, oldPassword, newPassword) {
        try {
            return await axiosInstance.patch(`/users/${userId}/password`, { oldPassword, newPassword });
        } catch (error) {
            throw error;
        }
    }

    static async getProfile(userId) {
        try {
            return await axiosInstance.get(`/users/${userId}`);
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin user với id: ${userId}`, error);
            throw error;
        }
    }

    static async editProfile(userId, data) {
        try {
            const formData = new FormData();
            formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }));
            if (data.avatar) {
                formData.append('avatar', data.avatar);
            }
            return await axiosInstance.put(`/users/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (error) {
            console.error(`Lỗi khi cập nhật thông tin user với id: ${userId}`, error);
            throw error;
        }
    }

    static async uploadAvatar(file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            return await axiosInstance.post('/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (error) {
            console.error('Lỗi khi upload avatar:', error);
            throw error;
        }
    }
}

export default UserService;