import axiosInstance from "./config";

class UserService {
    static async blockUser(userId) {
        try {
            return await axiosInstance.patch(`/users/${userId}/block`);
        } catch (error) {
            console.error(`Lỗi khi xóa user với id: ${userId}`, error);
            throw error;
        }
    }

    static async checkToken(token) {
        try {
            return await axiosInstance.get(`/users/check-token/${token}`);
        } catch (error) {
            console.error(`Lỗi khi reset password`, error);
            throw error;
        }
    }

    static async checkDuplicatePassword(param) {
        try {
            return await axiosInstance.patch(`/users/check-duplicate`,param);
        } catch (error) {
            console.error(`Lỗi trùng mật khẩu cũ`, error);
            throw error;
        }
    }

    static async resetPassword(param) {
        try {
            return await axiosInstance.patch(`/users/reset-password`, param);
        } catch (error) {
            console.error(`Lỗi khi reset password`, error);
            throw error;
        }
    }

    static async searchFollowNameAndEmail(keyName, keyEmail) {
        try {
            const params = {};
            if (keyName && keyName.trim() !== "") params.keyName = keyName;
            if (keyEmail && keyEmail.trim() !== "") params.keyEmail = keyEmail;
            return await axiosInstance.get("/users/search", {params});
        } catch (error) {
            console.error(`Lỗi khi tìm kiếm người dùng với keyName = ${keyName}, keyEmail = ${keyEmail}`, error);
            throw error;
        }
    }

    static async getAllExceptAdmin() {
        try {
            return await axiosInstance.get("/users");
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng", error);
            throw error;
        }
    }

    static async login(loginRequest) {
        try {
            return await axiosInstance.patch("/users/login", loginRequest);
        } catch (error) {
            throw error;
        }
    }

    static async register(form) {
        try {
            return await axiosInstance.post("/users/register", form);
        } catch (error) {
            throw error;
        }
    }

    static async changePassword(changePasswordRequest) {
        try {
            return await axiosInstance.patch("/users/change-password", changePasswordRequest);
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu", error);
            throw error;
        }
    }

    static async getProfile(email) {
        try {
            return await axiosInstance.get("/users/profile", {params: {email}});
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin user với email: ${email}`, error);
            throw error;
        }
    }

    static async editProfile(formData) {
        try {
            return await axiosInstance.patch("/users/edit", formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin user", error);
            throw error;
        }
    }
}

export default UserService;
